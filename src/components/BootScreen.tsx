import React, { useState, useEffect, useRef } from 'react';

const bootLines = [
  'Initializing Linux system startup sequence...',
  '[    0.000000] Linux version 6.2.3-cyber-x86_64 (GCC v11.2.0)',
  '[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-6.2.3 ro quiet splash security=selinux',
  '[    0.015243] x86/fpu: Supporting XSAVE feature 0x001: \'x87 floating point registers\'',
  '[    0.051210] BIOS-provided physical RAM map:',
  '[    0.051212] BIOS-e820: [mem 0x0000000000000000-0x000000000009ffff] usable',
  '[    0.051215] BIOS-e820: [mem 0x0000000000100000-0x000000003fffffff] usable',
  '[    0.115430] ACPI: Core revision 20221020',
  '[    0.284121] ACPI: 1 ACPI AML tables successfully acquired and loaded',
  '[    0.350114] CPU0: Virtual AMD Ryzen 9 5950X (4 cores) @ 3.4GHz',
  '[    0.510254] devtmpfs: initialized',
  '[    0.684112] clocksource: refined TSC loop calibration: 3393.621 MHz',
  '[    0.891045] PCI: Probing PCI hardware (bus 00)',
  '[    1.112431] SCSI subsystem initialized',
  '[    1.320490] libata version 3.00 loaded.',
  '[    1.564210] sda: sda1 (virtual ext4 block device, size 40GB)',
  '[    1.782049] EXT4-fs (sda1): mounted filesystem with ordered data mode. Opts: (null).',
  '[  OK  ] Started Virtual File System (VFS) core layers.',
  '[  OK  ] Mounting security core configurations...',
  '[  OK  ] Initializing Local Host Interfaces...',
  '[  OK  ] Started D-Bus System Message Bus.',
  '[  OK  ] Starting systemd-udevd hardware daemon...',
  '[  OK  ] Started systemd-udevd hardware daemon.',
  '[  OK  ] Starting Cryptographic Layer Manager...',
  '[  OK  ] Started Cryptographic Layer Manager.',
  '[  OK  ] Starting systemd-journald logs service...',
  '[  OK  ] Started systemd-journald logs service.',
  '[  OK  ] Loading Network Time Daemon...',
  '[  OK  ] Synchronized network clock v6.2.3.',
  '[  OK  ] Starting SSH Server Security Daemon...',
  '[  OK  ] Started sshd (port 22, interfaces: all).',
  '[  OK  ] Starting Nginx Secure Web Gateway...',
  '[  OK  ] Started nginx.service web server.',
  '[  OK  ] Starting User Manager for UID 1000...',
  '[  OK  ] Loaded user profile database (/etc/passwd).',
  '[  OK  ] Started Linux Cybersecurity Sandbox environment.',
  'System is fully operational. Forwarding ports...',
  'Entering Graphical User Interface (GDM)...'
];

interface BootScreenProps {
  onBootComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onBootComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const onBootCompleteRef = useRef(onBootComplete);

  useEffect(() => {
    onBootCompleteRef.current = onBootComplete;
  }, [onBootComplete]);

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootLines.length) {
        const line = bootLines[currentLine];
        if (typeof line === 'string') {
          setLogs(prev => [...prev, line]);
        }
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onBootCompleteRef.current();
        }, 1000); // Small pause at the end of logs
      }
    }, 70); // Rapid logging print

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="absolute inset-0 bg-black text-[#dfdbd2] font-mono text-xs sm:text-sm p-4 md:p-10 flex flex-col justify-end overflow-hidden select-none">
      <div className="max-h-full overflow-auto space-y-1">
        {logs.map((log, idx) => {
          const isOk = log && typeof log === 'string' && log.startsWith('[  OK  ]');
          return (
            <div key={idx} className="leading-relaxed">
              {isOk && log ? (
                <span>
                  [ <span className="text-green-500 font-bold">OK</span> ] {log.substring(8)}
                </span>
              ) : (
                <span>{log || ''}</span>
              )}
            </div>
          );
        })}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
