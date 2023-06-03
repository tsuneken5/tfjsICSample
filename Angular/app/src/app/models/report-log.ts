export const ReportRogLabels: string[] = ['process', 'time']

export class ReportLog {
  constructor(
    public process: string,
    public time: string
  ) { }
}
