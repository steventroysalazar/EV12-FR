export interface CommandParam {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "boolean";
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  defaultValue?: string | number;
  description?: string;
  suffix?: string;
}

export interface SMSCommand {
  id: string;
  name: string;
  category: "Basic" | "Control" | "Alarms" | "Monitoring" | "Network";
  structure: string;
  params: CommandParam[];
  generateMessage: (params: Record<string, any>) => string;
}

export const EVIEW_COMMANDS: SMSCommand[] = [
  {
    id: "set_contacts",
    name: "Set Contact Numbers",
    category: "Basic",
    structure: "A(n),(SMS Yes/No),(call Yes/No),(phone number)",
    params: [
      { name: "n", label: "Contact Slot", type: "number", defaultValue: 1, description: "1-10" },
      { name: "sms", label: "Receive SMS", type: "select", defaultValue: 1, options: [{ label: "Yes", value: 1 }, { label: "No", value: 0 }] },
      { name: "call", label: "Receive Call", type: "select", defaultValue: 1, options: [{ label: "Yes", value: 1 }, { label: "No", value: 0 }] },
      { name: "phone", label: "Phone Number", type: "text", placeholder: "e.g. 123456789" }
    ],
    generateMessage: (p) => `A${p.n},${p.sms},${p.call},${p.phone}`
  },
  {
    id: "loc",
    name: "Request Location",
    category: "Monitoring",
    structure: "loc",
    params: [],
    generateMessage: () => "loc"
  },
  {
    id: "fall_down",
    name: "Fall Down Alarm",
    category: "Alarms",
    structure: "fl(on/off),(sensitivity),(call yes/no)",
    params: [
      { name: "on", label: "Status", type: "select", defaultValue: 1, options: [{ label: "On", value: 1 }, { label: "Off", value: 0 }] },
      { name: "sensitivity", label: "Sensitivity", type: "number", defaultValue: 5, description: "1-9 (1=least, 9=most)" },
      { name: "call", label: "Call on Alarm", type: "select", defaultValue: 1, options: [{ label: "Yes", value: 1 }, { label: "No", value: 0 }] }
    ],
    generateMessage: (p) => `fl${p.on},${p.sensitivity},${p.call}`
  },
  {
    id: "no_motion",
    name: "No Motion Alarm",
    category: "Alarms",
    structure: "nmo(on/off),(time),(call yes/no)",
    params: [
      { name: "on", label: "Status", type: "select", defaultValue: 1, options: [{ label: "On", value: 1 }, { label: "Off", value: 0 }] },
      { name: "time", label: "Static Time", type: "number", defaultValue: 60, suffix: "min", description: "Minutes of no motion" },
      { name: "call", label: "Call on Alarm", type: "select", defaultValue: 1, options: [{ label: "Yes", value: 1 }, { label: "No", value: 0 }] }
    ],
    generateMessage: (p) => `NMO${p.on},${p.time}M,${p.call}`
  },
  {
    id: "working_mode",
    name: "Set Working Mode",
    category: "Control",
    structure: "mode(n)",
    params: [
      { 
        name: "mode", 
        label: "Mode", 
        type: "select", 
        defaultValue: 1, 
        options: [
          { label: "Mode 1: Only in events", value: 1 },
          { label: "Mode 2: Events & interval", value: 2 },
          { label: "Mode 3: Always on", value: 3 },
          { label: "Mode 4: Events & interval (data only)", value: 4 },
          { label: "Mode 5: SOS Only", value: 5 },
          { label: "Mode 6: Events & Activated", value: 6 }
        ] 
      }
    ],
    generateMessage: (p) => `mode${p.mode}`
  },
  {
    id: "sos_button",
    name: "SOS Button Mode",
    category: "Alarms",
    structure: "SOS(mode),(time)",
    params: [
      { name: "mode", label: "Trigger Type", type: "select", defaultValue: 1, options: [{ label: "Long Press", value: 1 }, { label: "Double Click", value: 2 }] },
      { name: "time", label: "Press Time", type: "number", defaultValue: 20, suffix: "x0.1s", description: "20 = 2 seconds" }
    ],
    generateMessage: (p) => `SOS${p.mode},${p.time}`
  },
  {
    id: "sos_loops",
    name: "SOS Call Loops",
    category: "Alarms",
    structure: "Loop(time)",
    params: [
      { name: "time", label: "Cycles", type: "number", defaultValue: 5, description: "0=infinite, 1-10=times" }
    ],
    generateMessage: (p) => `Loop${p.time}`
  },
  {
    id: "whitelist",
    name: "SMS White List",
    category: "Network",
    structure: "sms(n)",
    params: [
      { name: "n", label: "Status", type: "select", defaultValue: 0, options: [{ label: "Off (All numbers)", value: 0 }, { label: "On (Authorized only)", value: 1 }] }
    ],
    generateMessage: (p) => `sms${p.n}`
  },
  {
    id: "timezone",
    name: "Set Time Zone",
    category: "Basic",
    structure: "tz(zone):(minute)",
    params: [
      { name: "zone", label: "Zone", type: "text", defaultValue: "+8", placeholder: "+8 or -5" },
      { name: "min", label: "Minute Offset", type: "select", defaultValue: "00", options: [{ label: "00", value: "00" }, { label: "15", value: "15" }, { label: "30", value: "30" }, { label: "45", value: "45" }] }
    ],
    generateMessage: (p) => `tz${p.zone}:${p.min}`
  },
  {
    id: "apn",
    name: "Set APN",
    category: "Network",
    structure: "S1,(apn)",
    params: [
      { name: "apn", label: "APN Name", type: "text", placeholder: "e.g. internet" }
    ],
    generateMessage: (p) => `S1,${p.apn}`
  },
  {
    id: "server",
    name: "Set Server IP",
    category: "Network",
    structure: "IP1,(ip),(port)",
    params: [
      { name: "ip", label: "Server IP/Domain", type: "text", placeholder: "e.g. 1.2.3.4" },
      { name: "port", label: "Port", type: "number", defaultValue: 6060 }
    ],
    generateMessage: (p) => `IP1,${p.ip},${p.port}`
  },
  {
    id: "status",
    name: "Check Status",
    category: "Monitoring",
    structure: "status",
    params: [],
    generateMessage: () => "status"
  },
  {
    id: "reboot",
    name: "Reboot Device",
    category: "Control",
    structure: "reboot",
    params: [],
    generateMessage: () => "reboot"
  },
  {
    id: "findme",
    name: "Find My Device",
    category: "Control",
    structure: "findme",
    params: [],
    generateMessage: () => "findme"
  },
  {
    id: "mic_volume",
    name: "Microphone Volume",
    category: "Control",
    structure: "Micvolume(level)",
    params: [
      { name: "level", label: "Volume Level", type: "number", defaultValue: 10, description: "0-15" }
    ],
    generateMessage: (p) => `Micvolume${p.level}`
  },
  {
    id: "speaker_volume",
    name: "Speaker Volume",
    category: "Control",
    structure: "speakervolume(level)",
    params: [
      { name: "level", label: "Volume Level", type: "number", defaultValue: 90, description: "0-100" }
    ],
    generateMessage: (p) => `speakervolume${p.level}`
  }
];
