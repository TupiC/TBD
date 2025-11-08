import localFont from "next/font/local";

export const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
export const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

// TODO: adjust fallback to serif, but currently not working (bug?)
export const merriweather = localFont({
  display: "swap",
  src: "./fonts/Merriweather.ttf",
  variable: "--font-merriweather",
});

export const merriweatherItalic = localFont({
  display: "swap",
  src: "./fonts/Merriweather-Italic.ttf",
  variable: "--font-merriweather-italic",
});

export const roboto = localFont({
  display: "swap",
  src: "./fonts/Roboto.ttf",
  variable: "--font-roboto",
});

export const robotoItalic = localFont({
  display: "swap",
  src: "./fonts/Roboto-Italic.ttf",
  variable: "--font-roboto-italic",
});
