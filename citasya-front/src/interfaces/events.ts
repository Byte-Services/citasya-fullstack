import { BaseEntity } from "./common";

export interface EventType extends BaseEntity {
  name: string;
  description: string;
  color: string;
}