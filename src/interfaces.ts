export namespace Maccabi {
  export interface AppointmentJson {
    MAC_BRANCHNAME: string;
    CURDATE: Date;
    STIME: string;
    ETIME: string;
    USERLOGIN: string;
    RESOURCENAME: string;
    STATDES: string;
  }

  export interface Line {
    line_id: number;
    clinic_id: string;
    clinic_name: string;
    doctor_id: number;
    doctor_name: string;
    near_clinic: boolean;
    appointment_json: AppointmentJson;
    clinic_address: string;
    clinic_lat: string;
    clinic_lng: string;
    clinic_data: string;
    clinic_content: string;
    clinic_phone: string;
    clinic_fax: string;
    accesibility_html: string;
    navigation: string;
  }

  export interface DayLine {
    time: string;
    month: string;
    day: string;
    dayname: string;
    year: string;
    lines: Line[];
  }

  export type DateLine = Record<string, DayLine>;
  export type Dates = Record<string, DateLine>;

  export interface Doctor {
    doc_licsense: number;
    doc_name: string;
  }

  export type Doctors = Record<string, Doctor>;

  export interface Response {
    status: string;
    lines: Dates;
    doctors: Doctors;
    pages: number;
  }
}
