export interface GuestsDto {
  firstGuestId: number;
  secondGuestId: number;
}

export interface MeetingDto extends GuestsDto {
  meetingBatchId: number;
}

export interface Meeting extends MeetingDto {
  id: number;
}
