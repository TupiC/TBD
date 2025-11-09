import { Category, Experience } from "./experience.type";

export type MapPoint = {
  id: string | number;
  lat: number;
  lng: number;
  title: Experience["name"];
  thumbnailUrl: Experience["hero_image"];
  description: Experience["summary"];
  category: Category;      
  url?: string;             
};

export type TimelineExp = Experience & MapPoint & {
  startDate: string;
  endDate: string;
};