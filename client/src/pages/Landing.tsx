import { useState } from "react";
import { Link } from "react-router-dom";
import { getLanguage, setLanguage } from "../lib/api";

interface VisaCard {
  visaType: string;
  title: string;
  subtitle: string;
}

const cards: VisaCard[] = [
  { visaType: "b1b2", title: "Tourist Visa (B1/B2)", subtitle: "Consular interview, ~3 minutes" },
  { visaType: "f1", title: "Student Visa (F-1)", subtitle: "Consular interview, ~4 minutes" },
  { visaType: "n400", title: "Citizenship (N-400)", subtitle: "USCIS interview, ~6 minutes" },
];

// Full language names (feature #8). Tavus rejects language codes.
const languages = [
  "english",
  "spanish",
  "french",
  "german",
  "hindi",
  "chinese",
  "arabic",
  "portuguese",
  "multilingual",
];

export default function Landing() {
  const [language, setLang] = useState<string>(getLanguage());

  const onLanguageChange = (value: string) => {
    setLang(value);
    setLanguage(value);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-ink">
      <div className="w-full max-w-md text-center mb-10">
        <h1 className="text-5xl font-semibold tracking-tight">FaceDrill</h1>
        <p className="mt-3 text-neutral-400">Practice your U.S. immigration interview.</p>
      </div>
      <div className="w-full max-w-md flex flex-col gap-3">
        {cards.map((c) => (
          <Link
            key={c.visaType}
            to={`/interview/${c.visaType}`}
            className="block rounded-xl border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900 transition px-5 py-4"
          >
            <div className="text-lg font-medium">{c.title}</div>
            <div className="text-sm text-neutral-400 mt-0.5">{c.subtitle}</div>
          </Link>
        ))}
      </div>
      <div className="w-full max-w-md mt-6 flex items-center justify-between text-sm">
        <label htmlFor="language" className="text-neutral-400">
          Interview language
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-100 capitalize focus:outline-none focus:border-neutral-600"
        >
          {languages.map((l) => (
            <option key={l} value={l} className="capitalize">
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
