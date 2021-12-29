export type Main = {
  data: [{ date: string; streams: [Stream] }];
};

export type Stream = {
  artist: {
    mbid: string;
    "#text": string;
  };
  streamable: string;
  image: [
    {
      size: string; // small
      "#text": string;
    },
    {
      size: string; // medium
      "#text": string;
    },
    {
      size: string; // large
      "#text": string;
    },
    {
      size: string;
      "#text": string;
    }
  ];
  mbid: string;
  album: {
    mbid: string;
    "#text": string;
  };
  name: string;
  url: string;
  date: {
    uts: string;
    "#text": string;
  };
};

export type IR = {
  payload: {
    songTitle: {
      count: number;
      streams: [];
      days: [day, day];
    };
  };
};

export type day = {
  // the logic here is that the day represents the earliest stream on that given day boundary. The count here represents the number of streams on that given associated day.
  song: { day: string; count: number };
};
export type Level = 0 | 1 | 2 | 3 | 4;

export interface Day {
  date: string;
  count: number;
  level: Level;
}

export type CalendarData = Array<Day | undefined>;

export type User = {
  username: string;
  realname: string;
  songs: {};
};
