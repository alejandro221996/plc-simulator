import type { Rung, PLCMemory, PowerFlowMap } from '../types/ladder'
import { useFaultStore } from '../store/faultStore'

export function evaluateRungs(rungs: Rung[], memory: PLCMemory, deltaTime: number): PLCMemory {
  // Read snapshot - this is what rungs read from (never mutated during scan)
  const readMemory: PLCMemory = {
    inputs: { ...memory.inputs },
    outputs: { ...memory.outputs },
    bits: { ...memory.bits },
    timers: Object.fromEntries(
      Object.entries(memory.timers).map(([k, v]) => [k, { ...v }])
    ),
  }
  
  // Write target - this is where rungs write to
  const writeMemory: PLCMemory = {
    inputs: { ...memory.inputs },
    outputs: { ...memory.outputs },
    bits: { ...memory.bits },
    timers: Object.fromEntries(
      Object.entries(memory.timers).map(([k, v]) => [k, { ...v }])
    ),
  }

  // If reset was pending from PREVIOUS scan, apply it now BEFORE evaluating
  if (readMemory.bits['B3:RESET']) {
    for (const timer of Object.values(writeMemory.timers)) {
      timer.accumulated = 0
      timer.done = false
      timer.timing = false
      timer.enabled = false
    }
    writeMemory.bits['B3:RESET'] = false
    // Clear outputs so lights turn off
    for (const key of Object.keys(writeMemory.outputs)) {
      writeMemory.outputs[key] = false
    }
    // Update readMemory so rungs see clean state
    for (const [addr, timer] of Object.entries(writeMemory.timers)) {
      readMemory.timers[addr] = { ...timer }
    }
    readMemory.bits['B3:RESET'] = false
    for (const key of Object.keys(readMemory.outputs)) {
      readMemory.outputs[key] = false
    }
    // Clear timer DN bits in readMemory too
    for (const [, timer] of Object.entries(readMemory.timers)) {
      timer.accumulated = 0
      timer.done = false
      timer.timing = false
      timer.enabled = false
    }
  }
  
  // Update timers based on read state
  for (const [addr, timer] of Object.entries(writeMemory.timers)) {
    const readTimer = readMemory.timers[addr]
    if (readTimer && readTimer.enabled && readTimer.timing) {
      timer.accumulated = Math.min(timer.accumulated + deltaTime, timer.preset)
      timer.done = timer.accumulated >= timer.preset
    }
  }
  
  // Update readMemory timers with accumulated values so rungs see updated DN bits
  for (const [addr, timer] of Object.entries(writeMemory.timers)) {
    readMemory.timers[addr] = { ...timer }
  }
  
  // Clear internal bits before evaluation (OTE pattern)
  for (const addr of Object.keys(writeMemory.bits)) {
    if (addr.startsWith('B3:')) {
      writeMemory.bits[addr] = false
    }
  }
  
  // Evaluate each rung: READ from readMemory, WRITE to writeMemory
  for (const rung of rungs) {
    evaluateRung(rung, readMemory, writeMemory)
  }
  
  // Apply faults after rungs evaluation, before return
  useFaultStore.getState().applyFaults(writeMemory)
  
  // NO reset here - if B3:0/1 was set by Rung 5, it stays set
  // and will be processed at the START of the NEXT scan
  
  return writeMemory
}

function evaluateRung(rung: Rung, readMemory: PLCMemory, writeMemory: PLCMemory): void {
  let power = true
  
  for (const element of rung.elements) {
    switch (element.type) {
      case 'contact-no':
        power = power && getAddressValue(element.address, readMemory)
        break
      case 'contact-nc':
        power = power && !getAddressValue(element.address, readMemory)
        break
      case 'coil':
        setAddressValue(element.address, power, writeMemory)
        break
      case 'timer-ton':
        handleTimerTON(element.address, power, writeMemory)
        break
    }
  }
}

function getAddressValue(address: string, memory: PLCMemory): boolean {
  if (address.startsWith('I:')) return memory.inputs[address] || false
  if (address.startsWith('O:')) return memory.outputs[address] || false
  if (address.startsWith('B3:')) return memory.bits[address] || false
  if (address.startsWith('T4:')) {
    const baseAddr = address.includes('.') ? address.split('.')[0] : address
    const timer = memory.timers[baseAddr]
    if (!timer) return false
    if (address.endsWith('.DN')) return timer.done
    if (address.endsWith('.TT')) return timer.timing
    if (address.endsWith('.EN')) return timer.enabled
    return timer.done
  }
  return false
}

function setAddressValue(address: string, value: boolean, memory: PLCMemory): void {
  if (address.startsWith('O:')) memory.outputs[address] = value
  if (address.startsWith('B3:')) {
    // Set-dominant: any rung with power can set the bit, but no rung can clear it
    // (bits are pre-cleared at scan start)
    if (value) memory.bits[address] = true
  }
}

function handleTimerTON(address: string, power: boolean, memory: PLCMemory): void {
  if (!memory.timers[address]) {
    memory.timers[address] = {
      preset: 5,
      accumulated: 0,
      done: false,
      timing: false,
      enabled: false
    }
  }
  
  const timer = memory.timers[address]
  timer.enabled = power
  
  if (power) {
    timer.timing = true
  } else {
    timer.timing = false
    timer.accumulated = 0
    timer.done = false
  }
}

export function evaluateRungWithFlow(rung: Rung, readMemory: PLCMemory): PowerFlowMap {
  let power = true
  const result: PowerFlowMap = {}
  
  for (const element of rung.elements) {
    const powerIn = power
    
    switch (element.type) {
      case 'contact-no':
        power = power && getAddressValue(element.address, readMemory)
        break
      case 'contact-nc':
        power = power && !getAddressValue(element.address, readMemory)
        break
      case 'coil':
      case 'timer-ton':
        break
    }
    
    result[element.id] = {
      powerIn,
      powerOut: power,
      blocking: powerIn && !power
    }
  }
  
  return result
}