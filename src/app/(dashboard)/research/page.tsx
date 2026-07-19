"use client";

import { useState, useMemo } from "react";
import { Search, Filter, BookOpen, Bookmark, FileText, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { researchData, type ResearchArticle } from "@/data/research";
import Footer from "@/components/layout/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const DOCUMENT_TYPES = [
  { label: "บทความวิจัย", count: 923 },
  { label: "บทความวิชาการ", count: 198 },
  { label: "รายงานการวิจัย", count: 64 },
  { label: "วิทยานิพนธ์", count: 41 },
  { label: "เอกสารนำเสนอ", count: 22 },
];

const FIELDS = [
  { label: "เภสัชกรรมคลินิก", count: 492 },
  { label: "เภสัชกรรมโรงพยาบาล", count: 318 },
  { label: "เภสัชกรรมชุมชน", count: 152 },
  { label: "เภสัชศาสตร์สังคมบริหาร", count: 98 },
  { label: "เภสัชเวทและพิษวิทยา", count: 76 },
];

const LANGUAGES = [
  { label: "ไทย", count: 892 },
  { label: "อังกฤษ", count: 356 },
];

const PUBLISHERS = [
  { label: "สภาเภสัชกรรม", count: 412 },
  { label: "วารสารเภสัชกรรมไทย", count: 267 },
  { label: "Thai Journal of Pharmacy Practice", count: 189 },
  { label: "อื่นๆ", count: 380 },
];

export default function ResearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);

  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ResearchArticle | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchQuery);
  };

  const toggleFilter = (
    state: string[],
    setState: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    if (state.includes(value)) {
      setState(state.filter((item) => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  const activeFilterCount =
    selectedTypes.length +
    selectedFields.length +
    selectedLangs.length +
    selectedPublishers.length +
    (startYear ? 1 : 0) +
    (endYear ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedFields([]);
    setSelectedLangs([]);
    setSelectedPublishers([]);
    setStartYear("");
    setEndYear("");
  };

  // Filter logic
  const filteredResults = useMemo(() => {
    let results = [...researchData];

    if (activeQuery) {
      const q = activeQuery.toLowerCase();
      results = results.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.abstract.toLowerCase().includes(q) ||
          item.authors.toLowerCase().includes(q)
      );
    }

    if (selectedTypes.length > 0) {
      results = results.filter((item) => selectedTypes.includes(item.type));
    }
    if (selectedFields.length > 0) {
      results = results.filter((item) => selectedFields.includes(item.field));
    }
    if (selectedLangs.length > 0) {
      results = results.filter((item) => selectedLangs.includes(item.language));
    }
    if (selectedPublishers.length > 0) {
      results = results.filter((item) =>
        selectedPublishers.includes(item.publisher)
      );
    }
    if (startYear) {
      results = results.filter((item) => item.year >= parseInt(startYear));
    }
    if (endYear) {
      results = results.filter((item) => item.year <= parseInt(endYear));
    }

    if (sortBy === "relevance") {
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } else if (sortBy === "newest") {
      results.sort((a, b) => b.year - a.year);
    } else if (sortBy === "oldest") {
      results.sort((a, b) => a.year - b.year);
    }

    return results;
  }, [
    activeQuery,
    selectedTypes,
    selectedFields,
    selectedLangs,
    selectedPublishers,
    startYear,
    endYear,
    sortBy,
  ]);

  /* ─── Filter sidebar content (shared between desktop & mobile) ─── */
  const filterContent = (
    <div className="space-y-6">
      {/* Document Type */}
      <div>
        <h3 className="text-[13px] font-bold text-foreground mb-2.5">
          ประเภทเอกสาร
        </h3>
        <div className="space-y-2">
          {DOCUMENT_TYPES.map((type, i) => (
            <label
              key={i}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                className="w-[15px] h-[15px] rounded border-gray-300 text-[#4D5A2D] focus:ring-[#4D5A2D] accent-[#4D5A2D]"
                checked={selectedTypes.includes(type.label)}
                onChange={() =>
                  toggleFilter(selectedTypes, setSelectedTypes, type.label)
                }
              />
              <span className="text-[13px] text-muted-foreground group-hover:text-foreground flex-1 leading-tight">
                {type.label}
              </span>
              <span className="text-[11px] text-muted-foreground/50">
                ({type.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Field */}
      <div>
        <h3 className="text-[13px] font-bold text-foreground mb-2.5">สาขา</h3>
        <div className="space-y-2">
          {FIELDS.map((field, i) => (
            <label
              key={i}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                className="w-[15px] h-[15px] rounded border-gray-300 text-[#4D5A2D] focus:ring-[#4D5A2D] accent-[#4D5A2D]"
                checked={selectedFields.includes(field.label)}
                onChange={() =>
                  toggleFilter(selectedFields, setSelectedFields, field.label)
                }
              />
              <span className="text-[13px] text-muted-foreground group-hover:text-foreground flex-1 leading-tight">
                {field.label}
              </span>
              <span className="text-[11px] text-muted-foreground/50">
                ({field.count})
              </span>
            </label>
          ))}
          <button className="text-[11px] text-[#4D5A2D] hover:underline flex items-center gap-1 mt-1.5 font-medium">
            แสดงเพิ่มเติม <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Year */}
      <div>
        <h3 className="text-[13px] font-bold text-foreground mb-2.5">
          ปีที่เผยแพร่
        </h3>
        <div className="flex items-center gap-2 mb-2.5">
          <input
            type="number"
            placeholder="ปีเริ่มต้น"
            className="w-full text-[12px] h-8 px-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-[#4D5A2D]"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
          />
          <span className="text-[11px] text-muted-foreground shrink-0">
            ถึง
          </span>
          <input
            type="number"
            placeholder="ปีสิ้นสุด"
            className="w-full text-[12px] h-8 px-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-[#4D5A2D]"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-[12px] font-medium"
        >
          นำไปใช้
        </Button>
      </div>

      {/* Language */}
      <div>
        <h3 className="text-[13px] font-bold text-foreground mb-2.5">ภาษา</h3>
        <div className="space-y-2">
          {LANGUAGES.map((lang, i) => (
            <label
              key={i}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                className="w-[15px] h-[15px] rounded border-gray-300 text-[#4D5A2D] focus:ring-[#4D5A2D] accent-[#4D5A2D]"
                checked={selectedLangs.includes(lang.label)}
                onChange={() =>
                  toggleFilter(selectedLangs, setSelectedLangs, lang.label)
                }
              />
              <span className="text-[13px] text-muted-foreground group-hover:text-foreground flex-1">
                {lang.label}
              </span>
              <span className="text-[11px] text-muted-foreground/50">
                ({lang.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Publisher */}
      <div>
        <h3 className="text-[13px] font-bold text-foreground mb-2.5">
          แหล่งเผยแพร่
        </h3>
        <div className="space-y-2">
          {PUBLISHERS.map((pub, i) => (
            <label
              key={i}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                className="w-[15px] h-[15px] rounded border-gray-300 text-[#4D5A2D] focus:ring-[#4D5A2D] accent-[#4D5A2D]"
                checked={selectedPublishers.includes(pub.label)}
                onChange={() =>
                  toggleFilter(
                    selectedPublishers,
                    setSelectedPublishers,
                    pub.label
                  )
                }
              />
              <span className="text-[13px] text-muted-foreground group-hover:text-foreground flex-1 leading-tight">
                {pub.label}
              </span>
              <span className="text-[11px] text-muted-foreground/50">
                ({pub.count})
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen pb-8">
        {/* ── Search Banner ── */}
        <div className="relative overflow-hidden rounded-lg mx-2 md:mx-4 mb-6 bg-gradient-to-br from-[#4D5A2D] via-[#5a6a33] to-[#3a4422]">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5" />

          <div className="relative z-10 px-6 md:px-8 pt-8 pb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  ค้นหางานวิจัยและบทความวิชาการ
                </h1>
                <p className="text-white/60 text-xs mt-0.5">
                  ฐานข้อมูลงานวิจัยทางเภสัชกรรม ราชวิทยาลัยเภสัชกรรม
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="พิมพ์คำค้นหา เช่น warfarin, เภสัชกรรมคลินิก..."
                  className="w-full h-11 pl-10 pr-10 rounded-lg text-sm text-foreground bg-white dark:bg-card border-0 focus:outline-none focus:ring-2 focus:ring-white/40 shadow-lg placeholder:text-muted-foreground/60"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                className="h-11 px-6 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold border border-white/20 rounded-lg shadow-sm transition-all"
              >
                <Search className="w-4 h-4 mr-2" />
                ค้นหา
              </Button>
            </form>
          </div>
        </div>

        {/* ── Content Area ── */}
        <div className="px-2 md:px-4">
          <div className="flex gap-5">
            {/* ── Desktop Filter Sidebar ── */}
            <aside className="hidden lg:block w-[260px] shrink-0">
              <div className="sticky top-24 bg-white dark:bg-card rounded-lg shadow-sm border border-border/60 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3.5 bg-muted/30 border-b border-border/50">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-[#4D5A2D] dark:text-[#a3a375]">
                    <SlidersHorizontal className="w-4 h-4" />
                    จำกัดผลการค้นหา
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[11px] text-destructive hover:underline"
                    >
                      ล้างทั้งหมด
                    </button>
                  )}
                </div>

                {/* Scrollable filter body */}
                <div className="px-4 py-4 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
                  {filterContent}
                </div>
              </div>
            </aside>

            {/* ── Mobile Filter Toggle ── */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
              <Button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="h-12 w-12 rounded-full bg-[#4D5A2D] hover:bg-[#3a4422] text-white shadow-xl"
                size="icon"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>

            {/* ── Mobile Filter Overlay ── */}
            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setMobileFilterOpen(false)}
                />
                <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] bg-white dark:bg-card rounded-t-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom">
                  <div className="flex items-center justify-between px-5 py-4 border-b">
                    <h2 className="font-bold text-[15px]">
                      ตัวกรอง ({activeFilterCount})
                    </h2>
                    <button onClick={() => setMobileFilterOpen(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="px-5 py-4 overflow-y-auto max-h-[65vh]">
                    {filterContent}
                  </div>
                </div>
              </div>
            )}

            {/* ── Results ── */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Result Header */}
              <div className="bg-white dark:bg-card px-4 py-3 rounded-lg shadow-sm border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="text-[13px] text-muted-foreground">
                  ผลการค้นหา{" "}
                  {activeQuery && (
                    <span className="font-semibold text-foreground">
                      &ldquo;{activeQuery}&rdquo;
                    </span>
                  )}
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-[#4D5A2D]/10 text-[#4D5A2D] dark:bg-[#4D5A2D]/20 dark:text-[#c4c48a] rounded-full text-[11px] font-semibold">
                    พบ {filteredResults.length} รายการ
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-muted-foreground whitespace-nowrap">
                    เรียงตาม:
                  </span>
                  <select
                    className="border border-border rounded-lg px-2.5 py-1.5 text-[12px] bg-background focus:outline-none focus:ring-1 focus:ring-[#4D5A2D] cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">เกี่ยวข้องมากที่สุด</option>
                    <option value="newest">ใหม่ไปเก่า</option>
                    <option value="oldest">เก่าไปใหม่</option>
                  </select>
                </div>
              </div>

              {/* Result Cards */}
              <div className="space-y-3">
                {filteredResults.length > 0 ? (
                  filteredResults.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-card rounded-lg shadow-sm border border-border/60 hover:border-[#4D5A2D]/20 transition-all duration-200 overflow-hidden"
                    >
                      <div className="p-5 md:p-6">
                        {/* Top row: badge + number */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-[#4D5A2D] text-white text-[11px] font-bold rounded-full shrink-0">
                              {idx + 1}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[11px] text-[#4D5A2D] border-[#4D5A2D]/25 bg-[#4D5A2D]/5 font-medium dark:text-[#c4c48a] dark:border-[#c4c48a]/25 dark:bg-[#c4c48a]/5"
                            >
                              {item.type}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground/60 shrink-0">
                            {item.language}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 
                          className="text-base md:text-[17px] font-bold text-foreground leading-snug mb-1.5 hover:text-[#4D5A2D] dark:hover:text-[#c4c48a] cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-start gap-2"
                          onClick={() => item.content ? setSelectedArticle(item) : null}
                        >
                          <span>{item.title}</span>
                          {item.content && (
                            <span className="shrink-0 text-[10px] font-medium text-[#4D5A2D] bg-[#4D5A2D]/10 px-2 py-0.5 rounded-full border border-[#4D5A2D]/20 mt-0.5">
                              อ่านเนื้อหาเต็ม
                            </span>
                          )}
                        </h2>

                        {/* Authors */}
                        <p className="text-[13px] text-[#4D5A2D]/80 dark:text-[#a3a375] font-medium mb-2">
                          {item.authors}
                        </p>

                        {/* Journal & Year */}
                        <p className="text-[12px] text-muted-foreground mb-3">
                          {item.journal} ({item.year})
                        </p>

                        {/* Abstract */}
                        <div className="text-[13px] text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                          <span className="font-semibold text-foreground/70">
                            บทคัดย่อ:
                          </span>{" "}
                          {item.abstract}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-3.5 border-t border-border/40">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 text-[11px] text-muted-foreground hover:text-foreground px-2.5"
                          >
                            <Bookmark className="w-3.5 h-3.5" /> บันทึก
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 text-[11px] text-muted-foreground hover:text-foreground px-2.5"
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              format_quote
                            </span>{" "}
                            อ้างอิง
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 text-[11px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-2.5"
                          >
                            <FileText className="w-3.5 h-3.5" /> PDF
                          </Button>

                          <div className="ml-auto text-[11px] text-muted-foreground/60 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">
                              link
                            </span>
                            DOI:{" "}
                            <a
                              href={`https://doi.org/${item.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline text-blue-500 dark:text-blue-400"
                            >
                              {item.doi}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-card p-12 rounded-lg shadow-sm border text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      ไม่พบผลการค้นหา
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      ลองเปลี่ยนคำค้นหา หรือปรับตัวกรองด้านซ้ายมือ
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredResults.length > 0 && (
                <div className="flex items-center justify-center gap-1.5 pt-6 pb-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-lg text-muted-foreground"
                    disabled
                  >
                    <span className="material-symbols-outlined text-sm">
                      chevron_left
                    </span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-8 h-8 rounded-lg bg-[#4D5A2D] hover:bg-[#3a4422] text-white"
                  >
                    1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 rounded-lg"
                  >
                    2
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 rounded-lg"
                  >
                    3
                  </Button>
                  <span className="px-1.5 text-muted-foreground text-sm">
                    …
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 rounded-lg"
                  >
                    125
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-lg text-muted-foreground"
                  >
                    <span className="material-symbols-outlined text-sm">
                      chevron_right
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="shrink-0 pb-4 border-b">
            <DialogTitle className="text-xl md:text-2xl text-[#4D5A2D] dark:text-[#c4c48a] pr-8 leading-tight">
              {selectedArticle?.title}
            </DialogTitle>
            <DialogDescription className="mt-2 text-foreground font-medium text-sm">
              <span className="text-muted-foreground">ผู้แต่ง:</span> {selectedArticle?.authors}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4 pr-4">
            <div className="text-[14px] text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {selectedArticle?.content}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}
