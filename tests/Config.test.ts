import { Config } from '../src'

describe('Config', () => {
  const data = {
    name: 'Weird Project',
    services: ['cloudflare']
  }

  describe('Policy', () => {
    it('should create document', () => {
      const c = new Config(data)
      const p = c.Policy('en')
  
      expect(p.data).toContain('# Cookie Policy')
    })
  
    it('should fail to create document with unsupported language', () => {
      const c = new Config(data)
  
      expect(
        () => c.Policy('eo')
      ).toThrowError()
    })
  })

  describe('Settings', () => {
    it('should create document', () => {
      const c = new Config(data)
      const p = c.Settings('en')
  
      expect(p.data).toContain('# Cookie Settings')
    })
  
    it('should fail to settings document with unsupported language', () => {
      const c = new Config(data)
  
      expect(
        () => c.Settings('eo')
      ).toThrowError()
    })
  })
})
