export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  due: string;
}

export interface GoalInput {
  name: string;
  target: string;
  due: string;
}
