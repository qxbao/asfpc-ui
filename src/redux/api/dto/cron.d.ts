type GetCronJobListResponse = {
  data: {
    [jobName: string]: JobStatus
  }
  count: number
};

type JobStatus = {
  id: string;
  name: string;
  next_run: string;
  last_run: string;
  is_running: boolean;
  tags?: string[];
};
