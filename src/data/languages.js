import { englishCurriculum } from "./content/english/curriculum";
import { mandarinCurriculum } from "./content/mandarin/curriculum";
import { japaneseCurriculum } from "./content/japanese/curriculum";

export const languages = [
  {
    id: "english",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    level: "A1",
    score: 0,
    skills: {
      speaking: 0,
      listening: 0,
      reading: 0,
      writing: 0,
      vocabulary: 0,
    },
    curriculum: englishCurriculum,
  },

  {
    id: "mandarin",
    name: "Mandarin",
    nativeName: "普通话",
    flag: "🇨🇳",
    level: "HSK 1",
    score: 0,
    skills: {
      speaking: 0,
      listening: 0,
      reading: 0,
      writing: 0,
      vocabulary: 0,
    },
    curriculum: mandarinCurriculum,
  },

  {
    id: "japanese",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    level: "N5",
    score: 0,
    skills: {
      speaking: 0,
      listening: 0,
      reading: 0,
      writing: 0,
      vocabulary: 0,
    },
    curriculum: japaneseCurriculum,
  },
];