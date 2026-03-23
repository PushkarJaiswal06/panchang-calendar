/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { format, getDay, isToday } from "date-fns";
import { hi } from "date-fns/locale";
import { Printer, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getPanchangForHinduMonth,
  PanchangData,
  MonthSummary,
} from "./services/panchangService";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DAYS_HINDI = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"];

const HINDU_MONTHS = [
  "चैत्र",
  "वैशाख",
  "ज्येष्ठ",
  "आषाढ़",
  "श्रावण",
  "भाद्रपद",
  "अश्विन",
  "कार्तिक",
  "मार्गशीर्ष",
  "पौष",
  "माघ",
  "फाल्गुन",
];

const HINDI_NUMERALS: Record<string, string> = {
  "0": "०",
  "1": "१",
  "2": "२",
  "3": "३",
  "4": "४",
  "5": "५",
  "6": "६",
  "7": "७",
  "8": "८",
  "9": "९",
};

const TITHI_NUMERAL_MAP: Record<string, string> = {
  प्रतिपदा: "१",
  द्वितीया: "२",
  तृतीया: "३",
  चतुर्थी: "४",
  पंचमी: "५",
  षष्ठी: "६",
  सप्तमी: "७",
  अष्टमी: "८",
  नवमी: "९",
  दशमी: "१०",
  एकादशी: "११",
  द्वादशी: "१२",
  त्रयोदशी: "१३",
  चतुर्दशी: "१४",
  पूर्णिमा: "१५",
  अमावस्या: "३०",
};

const PRIMARY_LOGO_URL =
  "src/data/images/prim_logo.png";
const PANCH_PARIVARTAN_IMAGE_URL =
  "src/data/images/panch_parivartan.png";
const SECONDARY_LOGO_URL =
  "https://res.cloudinary.com/dsg5tzzdg/image/upload/v1773212315/100-removebg-preview_l8ijbg.png";

const PAGE_HEADER_IMAGE_URLS = [
  "./pg-head-1.jpeg",
  "./pg-head-2.jpeg",
  "./pg-head-3.jpeg",
  "./pg-head-4.jpeg",
];

function toHindiNumerals(val: string | number): string {
  return String(val)
    .split("")
    .map((char) => HINDI_NUMERALS[char] || char)
    .join("");
}

function getTithiHindiNumber(tithi: string): string {
  for (const [name, number] of Object.entries(TITHI_NUMERAL_MAP)) {
    if (tithi.includes(name)) return number;
  }
  return "";
}

const GATIVIDHIS_IMG_URLS = [
  "https://res.cloudinary.com/dsg5tzzdg/image/upload/v1773215872/212_z5bghy.jpg",
  "https://res.cloudinary.com/dsg5tzzdg/image/upload/v1773215872/213_vkwlew.jpg",
  "https://res.cloudinary.com/dsg5tzzdg/image/upload/v1773215872/214_hmhcpm.jpg",
  "https://res.cloudinary.com/dsg5tzzdg/image/upload/v1773215872/215_fhksau.jpg",
  "https://res.cloudinary.com/dsg5tzzdg/image/upload/v1773216902/216_e1espe.jpg",
  "https://res.cloudinary.com/dsg5tzzdg/image/upload/v1773215873/WhatsApp_Image_2026-03-11_at_12.36.10_PM_usziqq.jpg",
  "https://res.cloudinary.com/dsg5tzzdg/image/upload/v1773215873/WhatsApp_Image_2026-03-11_at_12.36.11_PM_u9eqhi.jpg",
  "https://res.cloudinary.com/dsg5tzzdg/image/upload/v1773215873/211_oujyiw.jpg",
  "https://res.cloudinary.com/dsg5tzzdg/image/upload/v1773215873/210_mh7mjj.jpg",
  "https://res.cloudinary.com/dsg5tzzdg/image/upload/v1773215873/WhatsApp_Image_2026-03-11_at_12.36.10_PM_1_gjzxuk.jpg",
  "https://res.cloudinary.com/dsg5tzzdg/image/upload/v1773215872/WhatsApp_Image_2026-03-11_at_12.36.09_PM_2_skenxv.jpg",
  "https://res.cloudinary.com/dsg5tzzdg/image/upload/v1773215871/WhatsApp_Image_2026-03-11_at_12.36.09_PM_1_cyekcr.jpg",
];

const GATIVIDHIS = [
  {
    name: "महिला गतिविधि",
    points: [
      "मातृकुल परियोजना को प्रभावी बनाना",
      "महिला विषयक शोध को बढ़ावा देना",
      "भारतीय स्त्री विमर्श को प्रतिष्ठित करना",
    ],
  },
  {
    name: "गुरुकुल शिक्षा गतिविधि",
    points: [
      "आदर्श गुरुकुल प्रणाली को वैश्विक मुख्यधारा में स्थापित करना",
      "वर्तमान गुरुकुलों को युगानुकूल स्वरूप में पुनः प्रतिष्ठित करना",
      "नवीन गुरुकुलों की स्थापना में सहयोग एवं प्रशिक्षण",
    ],
  },
  {
    name: "विद्यालय शिक्षा गतिविधि",
    points: [
      "समग्र शिक्षा प्रदान करने के साधन",
      "शिक्षकों, अभिभावकों और शिक्षार्थियों में संवाद",
      "गुरुकुल बनाने की दिशा में अग्रसरित करना",
    ],
  },
  {
    name: "उच्च शिक्षा गतिविधि",
    points: [
      "भारतीय चिंतन व शोध पर आधारित",
      "कौशल आधारित शिक्षा",
      "राष्ट्रीय शिक्षा नीति २०२० का क्रियान्वयन",
    ],
  },
  {
    name: "शैक्षणिक शिक्षा गतिविधि",
    points: [
      "भारत केंद्रित पाठ्यक्रम निर्माण हेतु समितियों का गठन तथा उसके अनुरूप शिक्षकों का प्रशिक्षण",
      "शिक्षण सामग्री का भारतीयकरण",
      "मूल्य आधारित शिक्षा का समावेश",
    ],
  },
  {
    name: "अनुसंधान गतिविधि",
    points: [
      "भारतीय प्रविधियों पर आधारित भारत केंद्रित शोध को प्रोत्साहन",
      "भारतीय ज्ञान संपदा को समकालीन संदर्भों में प्रतिष्ठित करना",
      "शोधार्थियों का मार्गदर्शन एवं सहयोग",
    ],
  },
  {
    name: "प्रकाशन गतिविधि",
    points: [
      "प्रत्येक गतिविधियों के द्वारा किये गये प्रयासों को शोधों को प्रकाशित करना",
      "भारतीय ज्ञान परंपरा पर आधारित साहित्य का सृजन",
      "पत्र-पत्रिकाओं का नियमित प्रकाशन",
    ],
  },
  {
    name: "युवा गतिविधि",
    points: [
      "राष्ट्रभाव से प्रेरित बौद्धिक योद्धाओं का निर्माण",
      "युवक (युवा विकास अनुसंधान केंद्र) द्वारा युवाओं का प्रशिक्षण",
      "शोध, लेखन व विवेचन में तार्किक क्षमता का विकास",
    ],
  },
  {
    name: "भारतीय ज्ञान संपदा गतिविधि",
    points: [
      "भारतीय ज्ञान संपदा का संरक्षण एवं समाज के व्यवहार में उतारने हेतु साहित्यों का सरलीकरण",
      "प्राचीन ग्रंथों का आधुनिक संदर्भ में विश्लेषण",
      "ज्ञान परंपरा का जन-जन तक प्रसार",
    ],
  },
  {
    name: "शिक्षा एवं तंत्र ज्ञान गतिविधि",
    points: [
      "भारतीय ज्ञान को तकनीकी के युगानुकूल पंखों के द्वारा उड़ान देते हुये भारत को विश्व गुरु बनाना",
      "तकनीकी शिक्षा में भारतीय मूल्यों का समावेश",
      "डिजिटल माध्यमों का प्रभावी उपयोग",
    ],
  },
  {
    name: "शिक्षक शिक्षा गतिविधि",
    points: [
      "शिक्षकों में भारतीय दृष्टिकोण का विकास",
      "शिक्षक से गुरु, गुरु से ऋषि बनाना",
      "शिक्षक स्वाध्याय और आनंदशालाओं का आयोजन",
    ],
  },
  {
    name: "भारतीय भाषा गतिविधि",
    points: [
      "भारतीय भाषाओं में साहित्यों तथा विविध पाठ्यक्रमों का निर्माण",
      "संस्कृत तथा भारतीय भाषाओं को वैश्विक स्तर पर गौरव दिलाना",
      "मातृभाषा में शिक्षा को प्रोत्साहन",
    ],
  },
];

const MONTH_KARYA: Record<string, string[]> = {
  चैत्र: ["स्थापना दिवस", "वर्ष प्रतिपदा"],
  वैशाख: ["परिचायक वर्ग"],
  ज्येष्ठ: ["संपर्क", "कार्यकारिणी विस्तार", "नई कार्यकारिणी गठन"],
  आषाढ़: ["संपर्क", "कार्यकारिणी विस्तार", "नई कार्यकारिणी गठन"],
  श्रावण: ["व्यास पूजन उत्सव (आषाढ़ शुक्ल पूर्णिमा २९ जुलाई)", "तत्पश्चात सदस्यता अभियान"],
  भाद्रपद: ["शिक्षकों के बीच सम्पर्क", "आनन्दशालाएं", "शिक्षक स्वाध्याय", "शिक्षक सम्मान"],
  अश्विन: ["नए सम्पर्क", "दीपावली मिलन सम्बन्धित कार्यक्रम"],
  कार्तिक: ["आनन्दशालाएं"],
  मार्गशीर्ष: ["विमर्श के कार्यक्रम", "शिक्षा नीति पर चर्चा"],
  पौष: ["निबन्ध लेखन", "युवा दिवस सम्बंधित प्रतियोगिताएं एवं उद्बोधन", "माघ मेला दर्शन"],
  माघ: ["वसन्त पंचमी", "देव दर्शन"],
  फाल्गुन: ["होली मिलन"],
};

interface MonthProps {
  monthName: string;
  vikramSamvat: string;
  panchangData: PanchangData[];
  summary: MonthSummary;
  gatividhi: (typeof GATIVIDHIS)[0];
  monthIndex: number;
  key?: React.Key;
}

const MonthGrid = ({
  monthName,
  vikramSamvat,
  panchangData,
  summary,
  gatividhi,
  monthIndex,
}: MonthProps) => {
  const firstDay =
    panchangData.length > 0 ? new Date(panchangData[0].date) : new Date();
  const startDayOfWeek = getDay(firstDay);
  const monthImageUrl = GATIVIDHIS_IMG_URLS[monthIndex] || "";
  const monthKarya = MONTH_KARYA[monthName] || [];

  const gridDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    panchangData.forEach((day) => days.push(day));
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    return days;
  }, [panchangData, startDayOfWeek]);

  const gregorianRange = useMemo(() => {
    if (panchangData.length === 0) return "";
    const start = new Date(panchangData[0].date);
    const end = new Date(panchangData[panchangData.length - 1].date);
    return `${toHindiNumerals(format(start, "d"))} ${format(start, "MMM", { locale: hi })} - ${toHindiNumerals(format(end, "d"))} ${format(end, "MMM", { locale: hi })}, ${toHindiNumerals(format(end, "yyyy"))}`;
  }, [panchangData]);

  return (
    <div className="flex flex-col border-2 border-maroon/20 bg-white/75 p-4 rounded-sm shadow-sm relative">
      {/* Header Section */}
      <div className="relative z-10 flex justify-between items-end mb-4 border-b-2 border-saffron pb-2">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-3">
            <h2 className="text-4xl font-hindi font-bold text-maroon leading-none">
              {monthName} मास
            </h2>
            <span className="text-sm font-hindi text-saffron font-medium">
              (विक्रम संवत {toHindiNumerals(vikramSamvat)})
            </span>
          </div>
          <p className="text-xs font-hindi italic text-maroon/40 mt-1">
            {gregorianRange}
          </p>
        </div>
        <div className="text-right">
          <div className="flex flex-col items-end">
            <span className="text-xs font-hindi text-maroon/60">पक्ष</span>
            <div className="flex gap-2">
              <span className="text-xs font-hindi px-1 bg-saffron/20 text-maroon rounded">
                कृष्ण
              </span>
              <span className="text-xs font-hindi px-1 bg-gray-100 text-gray-600 rounded">
                शुक्ल
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex gap-4 flex-1">
        {/* Activity and Photos Area */}
        <div className="w-1/4 flex flex-col gap-3">
          <div className="p-3 border-2 border-maroon/10 rounded-lg bg-cream/30 flex flex-col gap-2">
            <h3 className="text-xl font-hindi font-bold text-maroon border-b border-maroon/20 pb-1">
              {toHindiNumerals(monthIndex + 1)}. {gatividhi.name}
            </h3>
            <ul className="flex flex-col gap-1.5">
              {gatividhi.points.map((point, i) => (
                <li
                  key={i}
                  className="text-[20px] font-hindi text-maroon leading-tight flex gap-1"
                >
                  <span>•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div className="aspect-video bg-cream border border-maroon/10 rounded overflow-hidden relative">
              {monthImageUrl ? (
                <img
                  src={monthImageUrl}
                  alt={`${gatividhi.name} चित्र`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-maroon/50 font-hindi text-sm bg-cream/40">
                  चित्र उपलब्ध नहीं
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date Grid + Right Info Panel */}
        <div className="relative flex-1 flex gap-4">
          <div className="relative flex-1">
            <div className="relative z-10 grid grid-cols-7 gap-px bg-maroon/10 border border-maroon/10">
              {DAYS_HINDI.map((day) => (
                <div key={day} className="bg-saffron/10 p-1 text-center">
                  <span className="text-[20px] font-hindi font-bold text-orange-600 uppercase tracking-wider">
                    {day}
                  </span>
                </div>
              ))}
              {gridDays.map((day, idx) => {
                if (!day)
                  return (
                    <div
                      key={idx}
                      className="bg-gray-50/50 h-20 border-t border-l border-maroon/5"
                    />
                  );

                const dateObj = new Date(day.date);
                const isSun = getDay(dateObj) === 0;

                const tithiNumber = getTithiHindiNumber(day.tithi);

                return (
                  <div
                    key={idx}
                    className={cn(
                      "h-20 p-1 flex flex-col border-t border-l border-maroon/5",
                      day.paksha === "कृष्ण" ? "bg-saffron/10" : "bg-gray-100",
                      isSun && "ring-1 ring-inset ring-maroon/10",
                    )}
                  >
                    {/* Top-left: Tithi + Nakshatra */}
                    <div className="flex flex-col gap-0.5 text-left">
                      <span
                        className="font-hindi text-maroon/80 leading-none font-medium whitespace-nowrap"
                        style={{ fontSize: day.tithi.length > 11 ? "10px" : "12px" }}
                      >
                        {day.tithi}
                      </span>
                      <span
                        className="font-hindi text-red/50 leading-none italic whitespace-nowrap"
                        style={{ fontSize: day.nakshatra.length > 8 ? "7px" : "8px" }}
                      >
                        {day.nakshatra}
                      </span>
                    </div>

                    {/* Center: Hindi tithi number */}
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-[32px] font-hindi font-bold leading-none text-maroon">
                        {tithiNumber}
                      </span>
                    </div>

                    {/* Bottom: Festival left, Gregorian date right */}
                    <div className="flex justify-between items-end gap-1 -translate-y-1">
                      {day.festival ? (
                        <span className="text-[7px] font-hindi text-white bg-maroon px-1 rounded leading-tight text-left max-w-[68%] truncate">
                          {day.festival}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span
                        className={cn(
                          "text-[10px] font-hindi font-bold leading-none shrink-0",
                          isSun ? "text-maroon" : "text-gray-800",
                          isToday(dateObj) && "text-saffron",
                        )}
                      >
                        ता॰ {format(dateObj, "d")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: कार्य + Festivals and Ayurvedic Advice */}
          <div className="relative z-10 w-[38%] min-w-[340px] flex flex-col gap-3">
            <div className="border border-maroon/10 rounded-sm bg-white/40 p-2">
              <h4 className="text-[11px] font-hindi font-bold text-maroon border-b border-maroon/10 mb-1 pb-0.5">
                प्रमुख उत्सव एवं तिथियाँ
              </h4>
              <div className="grid grid-cols-1 gap-y-0.5">
                {summary.festivals.slice(0, 8).map((f, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-[10px] font-hindi gap-2"
                  >
                    <span className="text-maroon font-medium truncate">{f.name}</span>
                    <span className="text-maroon font-bold shrink-0">{f.tithi}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-maroon/10 rounded-sm bg-white/40 p-2">
              <h4 className="text-[11px] font-hindi font-bold text-maroon border-b border-maroon/10 mb-1 pb-0.5">
                आयुर्वेद ऋतुचर्या (स्वास्थ्य परामर्श)
              </h4>
              <div className="grid grid-cols-1 gap-1">
                {summary.ayurvedicAdvice.slice(0, 3).map((a, i) => (
                  <div key={i} className="text-[10px] font-hindi leading-tight">
                    <span className="font-bold text-maroon">{a.category}: </span>
                    <span className="text-maroon font-medium">{a.advice}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-maroon/10 rounded-sm bg-white/40 p-2">
              <h4 className="text-[11px] font-hindi font-bold text-maroon border-b border-maroon/10 mb-1 pb-0.5">
                कार्य
              </h4>
              <ul className="space-y-1">
                {monthKarya.map((item, i) => (
                  <li key={i} className="text-[10px] font-hindi text-maroon leading-tight flex gap-1">
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [pageIndex, setPageIndex] = useState(0);
  const currentPageHeaderImage = PAGE_HEADER_IMAGE_URLS[pageIndex] || "";

  const currentMonths = useMemo(() => {
    const start = pageIndex * 3;
    return HINDU_MONTHS.slice(start, start + 3);
  }, [pageIndex]);

  const panchangCache = useMemo(() => {
    const cache: Record<
      string,
      { days: PanchangData[]; summary: MonthSummary }
    > = {};
    for (const monthName of currentMonths) {
      const samvat = "2083";
      const key = `${monthName}-${samvat}`;
      cache[key] = getPanchangForHinduMonth(monthName, samvat);
    }
    return cache;
  }, [currentMonths]);

  const handlePrev = () => setPageIndex((prev) => Math.max(0, prev - 1));
  const handleNext = () => setPageIndex((prev) => Math.min(3, prev + 1));
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-stone-100 p-4 md:p-8">
      {/* Controls */}
      <div className="max-w-360 mx-auto mb-6 flex justify-between items-center no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            disabled={pageIndex === 0}
            className="p-2 hover:bg-white disabled:opacity-30 rounded-full transition-colors border border-maroon/20 text-maroon"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-3xl font-hindi font-bold text-maroon leading-tight">
              शुद्ध पंचांग कैलेंडर (विक्रम संवत {toHindiNumerals(2083)})
            </h1>
            <span className="text-sm font-hindi text-saffron">
              चैत्र कृष्ण प्रतिपदा से फाल्गुन पूर्णिमा तक
            </span>
          </div>
          <button
            onClick={handleNext}
            disabled={pageIndex === 3}
            className="p-2 hover:bg-white disabled:opacity-30 rounded-full transition-colors border border-maroon/20 text-maroon"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-maroon text-white px-6 py-2 rounded-full hover:bg-maroon/90 transition-all shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span className="font-hindi">प्रिंट (१५ × १८)</span>
          </button>
        </div>
      </div>

      {/* Calendar Print Area */}
      <div className="max-w-360 mx-auto print-area bg-saffron/15 shadow-2xl relative overflow-hidden">
        {/* Decorative Border Pattern */}
        <div className="absolute inset-0 border-12 border-maroon pointer-events-none" />
        <div className="absolute inset-0 border-[24px] border-saffron/10 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={PRIMARY_LOGO_URL}
            alt=""
            className="w-[70%] max-w-[1100px] object-contain opacity-[0.08]"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute bottom-8 right-8 z-20 pointer-events-none">
          <img
            src={PANCH_PARIVARTAN_IMAGE_URL}
            alt="पंच परिवर्तन"
            className="w-44 h-auto object-contain"
          />
        </div>

        <div className="relative z-10 p-12 flex flex-col items-stretch">
          {/* Calendar Header */}
          <div className="text-center mb-8 flex flex-col items-center">
              <h4 className="text-4xl font-hindi font-bold text-maroon mb-1 tracking-wide leading-none">
              ॥ श्री गणेशाय नमः ॥
            </h4>
            <div className="w-full mb-6 relative min-h-[180px]">
              <img
                src={PRIMARY_LOGO_URL}
                alt="भारतीय शिक्षण मंडल मुख्य लोगो"
                className="absolute left-5 -top-10 h-62 w-62 object-contain"
              />
              <div className="max-w-20xl mx-auto px-32 mt-1 py-3">
                <h1 className="text-[6.5rem] font-hindi font-black text-maroon mb-1 tracking-tighter leading-none">
                  भारतीय शिक्षण मंडल
                </h1>
                <h3 className="text-[3.25rem] font-hindi font-bold text-saffron mb-2 leading-none">
                  गोरखपुर महानगर (गोरक्ष प्रांत)
                </h3>
                <div className="h-1 w-64 bg-saffron mx-auto mb-2" />
                <p className="font-hindi text-maroon text-[2rem] font-bold leading-none">
                  विक्रम संवत {toHindiNumerals(2083)} (वर्ष{" "}
                  {toHindiNumerals(2026)}-{toHindiNumerals(2027)})
                </p>
                {currentPageHeaderImage && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={currentPageHeaderImage}
                      alt={`पृष्ठ ${toHindiNumerals(pageIndex + 1)} शीर्ष चित्र`}
                      className="w-[95%] h-[6.0in] object-contain rounded-md border border-maroon/20"
                    />
                  </div>
                )}
              </div>
              <img
                src={SECONDARY_LOGO_URL}
                alt="भारतीय शिक्षण मंडल द्वितीयक लोगो"
                className="absolute right-4 -top-12 h-67 w-67 object-contain"
              // absolute left-5 -top-10 h-62 w-62 object-contain
              />
            </div>
          </div>

          {/* 3 Hindu Months Layout */}
          <div className="grid gap-8">
            {currentMonths.map((monthName, idx) => {
              const monthIdx = pageIndex * 3 + idx;
              const data = panchangCache[`${monthName}-2083`];
              return (
                <MonthGrid
                  key={idx}
                  monthName={monthName}
                  vikramSamvat="2083"
                  panchangData={data?.days || []}
                  summary={
                    data?.summary || { festivals: [], ayurvedicAdvice: [] }
                  }
                  gatividhi={GATIVIDHIS[monthIdx]}
                  monthIndex={monthIdx}
                />
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-between items-end border-t-2 border-maroon/20 pt-4">
            <div className="text-maroon/40 font-hindi text-sm">
              पारंपरिक हिंदू पंचांग • विक्रम संवत {toHindiNumerals(2083)}
            </div>
            <div className="text-right"></div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-360 mx-auto mt-8 p-6 bg-white rounded-xl border border-maroon/10 no-print">
        {/* <h3 className="font-hindi font-bold text-maroon mb-2">निर्देश:</h3> */}
        <ul className="list-disc list-inside text-sm text-maroon/70 space-y-1 font-hindi">
          {/* <li>यह कैलेंडर पूर्णतः **पंचांग पद्धति** (Lunar Months) पर आधारित है।</li>
          <li>प्रत्येक पृष्ठ पर ३ **हिंदी मास** दिखाए गए हैं।</li>
          <li>महीना **कृष्ण प्रतिपदा** (होली के अगले दिन) से शुरू होता है।</li>
          <li>ग्रिड में हिंदी गणना (तिथि) ऊपर और अंग्रेजी गणना (तारीख) नीचे है।</li>
          <li>**भारतीय शिक्षण मंडल** की १२ गतिविधियों का विवरण प्रत्येक माह में दिया गया है।</li>
          <li>संपूर्ण पंचांग में केवल **हिंदी अंकों** का प्रयोग किया गया है।</li> */}
        </ul>
      </div>
    </div>
  );
}
