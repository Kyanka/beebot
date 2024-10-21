import { Meeting, MeetingDto } from "../meeting/meeting.dto";

export interface UserDto {
  slackId: string;
  email: string;
  name: string;
}

export interface UserType extends UserDto {
  id: number;
}

export interface UserWithLastMeeting extends UserType {
  id: number;
  lastMeeting: Meeting[] | null;
}
