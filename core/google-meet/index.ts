import { google } from 'googleapis';
import { Resource } from 'sst';


export module GoogleCalendar { 
    const jwtClient = new google.auth.JWT({
        email: Resource.GoogleCloudClientEmail.value,
        key: Resource.GoogleCloudPrivateKey.value.split(String.raw`\n`).join('\n'),
        scopes: ['https://www.googleapis.com/auth/calendar'], // You can add more scopes as needed
      });
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    
    export async function createMeeting() {
        const res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: 'kateryna.mozghova@codeandcakes.com and mozgoprod@gmail.com',
                description: 'Beebot watches you',
                start: {
                  dateTime: '2024-10-07T10:00:00-07:00',
                  timeZone: 'America/Los_Angeles',
                },
                end: {
                  dateTime: '2024-10-07T11:00:00-07:00',
                  timeZone: 'America/Los_Angeles',
                },
                attendees: [
                  { email: 'mozgoprod@gmail.com' },
                  { email: 'kateryna.mozghova@codeandcakes.com' },
                ],
                conferenceData: {
                  createRequest: {
                    conferenceSolutionKey: {
                      type: "hangoutsMeet"
                    }
                  }
                },
                reminders: {
                  useDefault: true,
                },
              },
            conferenceDataVersion: 1,  // so that GMeet link gets created
            sendUpdates: 'all',
        })

        console.log(res)
        return res
    }
      
}

