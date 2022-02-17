import * as os from 'os';

import { Uuid, UuidOptions } from '../../src/index';

const ipAddressMock = '192.168.68.102';
const macAddressMock = 'd0:4a:6e:32:b5:6c';
const networkInterfacesMock = {
  en0: [
    {
      address: 'fe80::1882:f8ec:3bc9:d49e',
      netmask: 'ffff:ffff:ffff:ffff::',
      family: 'IPv6',
      mac: macAddressMock,
      internal: false,
      cidr: 'fe80::1882:f8ec:3bc9:d49e/64',
      scopeid: 14,
    } as unknown as os.NetworkInterfaceInfo,
    {
      address: ipAddressMock,
      netmask: '255.255.255.0',
      family: 'IPv4',
      mac: macAddressMock,
      internal: false,
      cidr: `${ipAddressMock}/24`,
    } as unknown as os.NetworkInterfaceInfo,
  ],
};

const osMock = {
  networkInterfaces: jest.fn(() => networkInterfacesMock),
};

jest.mock('os', () => ({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  networkInterfaces: () => osMock.networkInterfaces(),
}));

const options: UuidOptions = {
  length: 50,
  prefix: 'test-',
};

describe('Uuid Tests', () => {
  describe('generate', () => {
    test('should be able to generate a uuid', () => {
      const uuid: string = Uuid.generate();
      expect(uuid).toBeDefined();
      expect(uuid.length).toBeGreaterThan(0);
      expect(uuid).not.toContain('test-');
    });

    test('should be able to generate a uuid with options', () => {
      const uuid: string = Uuid.generate(options);
      expect(uuid).toBeDefined();
      expect(uuid.length).toEqual(50);
      expect(uuid).toContain('test-');
    });
  });

  describe('getPid', () => {
    test('should be able to get the process id', () => {
      const pid: number = Uuid.getPid();
      expect(pid).toBeDefined();
      expect(pid.toString().length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getAddress', () => {
    test('should be able to get the mac address', () => {
      const address: number = Uuid.getAddress();
      expect(address).toBeDefined();
      expect(address.toString().length).toBeGreaterThanOrEqual(6);
    });

    test('should be able to get the ipv6 address', () => {
      const ipv6NetworkInterfaces = {
        en0: [
          {
            address: 'fe80::1883:f8ec:3bc9:d49e',
            netmask: 'ffff:ffff:ffff:ffff::',
            family: 'IPv6',
            mac: undefined,
            internal: false,
            cidr: 'fe80::1882:f8ec:3bc9:d49e/64',
            scopeid: 14,
          } as unknown as os.NetworkInterfaceInfo,
        ],
      };
      osMock.networkInterfaces.mockReturnValueOnce(ipv6NetworkInterfaces);
      const address: number = Uuid.getAddress();
      expect(address).toBeDefined();
      expect(address.toString().length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('getIpV6', () => {
    test('should be able to get the ipv6 address from the network interface', () => {
      const networkInterfaces = os.networkInterfaces();
      for (const key in networkInterfaces) {
        const netInterface: os.NetworkInterfaceInfo[] | undefined = networkInterfaces[key];
        const ipv6: number[] = Uuid.getIpV6(netInterface![0]);
        expect(ipv6[0]).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('getNow', () => {
    test('should be able to get the current epoch time', () => {
      const time: number = Uuid.getNow();
      expect(time).toBeDefined();
      expect(time.toString().length).toEqual(13);
      expect(time).toBeGreaterThan(1_549_823_202_077);
    });
  });

  describe('postProcessUuid', () => {
    test('should be able to limit the length of the uuid', () => {
      let uuid: string = Uuid.generate(options);
      expect(uuid).toBeDefined();
      expect(uuid.length).toEqual(50);
      expect(uuid).toContain('test-');
      uuid = Uuid.postProcessUuid(uuid, 30);
      expect(uuid.length).toEqual(30);
    });

    test('should be able to pad the uuid', () => {
      let uuid: string = Uuid.generate(options);
      expect(uuid).toBeDefined();
      expect(uuid.length).toEqual(50);
      expect(uuid).toContain('test-');

      uuid = Uuid.postProcessUuid(uuid, 80);
      expect(uuid.length).toEqual(80);
    });

    test('should be able to keep the length of the uuid', () => {
      let uuid: string = Uuid.generate(options);
      expect(uuid).toBeDefined();
      expect(uuid.length).toEqual(50);
      expect(uuid).toContain('test-');

      uuid = Uuid.postProcessUuid(uuid);
      expect(uuid.length).toEqual(50);
    });
  });
});
