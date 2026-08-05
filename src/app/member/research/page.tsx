"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen, Bookmark, FileText, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { researchData, type ResearchArticle } from "@/roles/member/features/research/data/research";
import Footer from "@/roles/shared/components/layout/Footer";
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

const filterCheckboxClass =
  "size-[15px] rounded border-outline text-brand accent-brand focus:ring-brand";
const filterInputClass =
  "h-8 w-full rounded-md border border-outline bg-surface px-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand";

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
        <h3 className="mb-2.5 text-caption font-bold text-content">
          ประเภทเอกสาร
        </h3>
        <div className="space-y-2">
          {DOCUMENT_TYPES.map((type, i) => (
            <label
              key={i}
              className="group flex cursor-pointer items-center gap-2.5"
            >
              <input
                type="checkbox"
                className={filterCheckboxClass}
                checked={selectedTypes.includes(type.label)}
                onChange={() =>
                  toggleFilter(selectedTypes, setSelectedTypes, type.label)
                }
              />
              <span className="flex-1 text-caption leading-tight text-content-muted group-hover:text-content">
                {type.label}
              </span>
              <span className="text-2xs text-content-muted/50">
                ({type.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Field */}
      <div>
        <h3 className="mb-2.5 text-caption font-bold text-content">สาขา</h3>
        <div className="space-y-2">
          {FIELDS.map((field, i) => (
            <label
              key={i}
              className="group flex cursor-pointer items-center gap-2.5"
            >
              <input
                type="checkbox"
                className={filterCheckboxClass}
                checked={selectedFields.includes(field.label)}
                onChange={() =>
                  toggleFilter(selectedFields, setSelectedFields, field.label)
                }
              />
              <span className="flex-1 text-caption leading-tight text-content-muted group-hover:text-content">
                {field.label}
              </span>
              <span className="text-2xs text-content-muted/50">
                ({field.count})
              </span>
            </label>
          ))}
          <button className="mt-1.5 flex items-center gap-1 text-2xs font-medium text-brand hover:underline">
            แสดงเพิ่มเติม <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Year */}
      <div>
        <h3 className="mb-2.5 text-caption font-bold text-content">
          ปีที่เผยแพร่
        </h3>
        <div className="flex items-center gap-2 mb-2.5">
          <input
            type="number"
            placeholder="ปีเริ่มต้น"
            className={filterInputClass}
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
          />
          <span className="shrink-0 text-2xs text-content-muted">
            ถึง
          </span>
          <input
            type="number"
            placeholder="ปีสิ้นสุด"
            className={filterInputClass}
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs font-medium"
        >
          นำไปใช้
        </Button>
      </div>

      {/* Language */}
      <div>
        <h3 className="mb-2.5 text-caption font-bold text-content">ภาษา</h3>
        <div className="space-y-2">
          {LANGUAGES.map((lang, i) => (
            <label
              key={i}
              className="group flex cursor-pointer items-center gap-2.5"
            >
              <input
                type="checkbox"
                className={filterCheckboxClass}
                checked={selectedLangs.includes(lang.label)}
                onChange={() =>
                  toggleFilter(selectedLangs, setSelectedLangs, lang.label)
                }
              />
              <span className="flex-1 text-caption text-content-muted group-hover:text-content">
                {lang.label}
              </span>
              <span className="text-2xs text-content-muted/50">
                ({lang.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Publisher */}
      <div>
        <h3 className="mb-2.5 text-caption font-bold text-content">
          แหล่งเผยแพร่
        </h3>
        <div className="space-y-2">
          {PUBLISHERS.map((pub, i) => (
            <label
              key={i}
              className="group flex cursor-pointer items-center gap-2.5"
            >
              <input
                type="checkbox"
                className={filterCheckboxClass}
                checked={selectedPublishers.includes(pub.label)}
                onChange={() =>
                  toggleFilter(
                    selectedPublishers,
                    setSelectedPublishers,
                    pub.label
                  )
                }
              />
              <span className="flex-1 text-caption leading-tight text-content-muted group-hover:text-content">
                {pub.label}
              </span>
              <span className="text-2xs text-content-muted/50">
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
        <div className="relative mx-2 mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand to-brand-strong md:mx-4">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 size-64 rounded-full bg-brand-foreground/5" />
          <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-brand-foreground/5" />

          <div className="relative z-10 px-6 md:px-8 pt-8 pb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-foreground/15 backdrop-blur-sm">
                <Search className="size-5 text-brand-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-brand-foreground md:text-2xl">
                  ค้นหางานวิจัยและบทความวิชาการ
                </h1>
                <p className="mt-0.5 text-xs text-brand-foreground/60">
                  ฐานข้อมูลงานวิจัยทางเภสัชกรรม ราชวิทยาลัยเภสัชกรรม
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-content-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="พิมพ์คำค้นหา เช่น warfarin, เภสัชกรรมคลินิก..."
                  className="h-11 w-full rounded-xl border-0 bg-surface-raised pl-10 pr-10 text-sm text-content shadow-lg placeholder:text-content-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-foreground/40"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted transition-colors hover:text-content"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                className="h-11 rounded-xl border border-brand-foreground/20 bg-brand-foreground/15 px-6 font-semibold text-brand-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-brand-foreground/25"
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
              <div className="sticky top-24 overflow-hidden rounded-xl border border-outline/60 bg-surface-raised shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-outline/50 bg-surface/30 px-4 py-3.5">
                  <div className="flex items-center gap-2 text-caption font-bold text-brand">
                    <SlidersHorizontal className="w-4 h-4" />
                    จำกัดผลการค้นหา
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-2xs text-destructive hover:underline"
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
                className="size-12 rounded-full bg-brand text-brand-foreground shadow-xl hover:bg-brand-strong"
                size="icon"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-danger text-3xs font-bold text-destructive-foreground">
                  {activeFilterCount}
                </span>
              )}
            </div>

            {/* ── Mobile Filter Overlay ── */}
            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="absolute inset-0 bg-content/50 backdrop-blur-sm"
                  onClick={() => setMobileFilterOpen(false)}
                />
                <div className="absolute right-0 bottom-0 left-0 max-h-[80vh] overflow-hidden rounded-t-2xl bg-surface-raised shadow-xl animate-in slide-in-from-bottom">
                  <div className="flex items-center justify-between border-b border-outline px-5 py-4">
                    <h2 className="font-bold text-sm">
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
              <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-outline/60 bg-surface-raised px-4 py-3 shadow-sm sm:flex-row sm:items-center">
                <div className="text-caption text-content-muted">
                  ผลการค้นหา{" "}
                  {activeQuery && (
                    <span className="font-semibold text-content">
                      &ldquo;{activeQuery}&rdquo;
                    </span>
                  )}
                  <span className="ml-2 inline-flex items-center rounded-full bg-brand-soft px-2 py-0.5 text-2xs font-semibold text-brand">
                    พบ {filteredResults.length} รายการ
                  </span>
                </div>

                <div className="flex items-center gap-2 text-caption">
                  <span className="whitespace-nowrap text-content-muted">
                    เรียงตาม:
                  </span>
                  <select
                    className="cursor-pointer rounded-lg border border-outline bg-surface px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
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
                      className="overflow-hidden rounded-xl border border-outline/60 bg-surface-raised shadow-sm transition-all duration-200 hover:border-brand/20 hover:shadow-md"
                    >
                      <div className="p-5 md:p-6">
                        {/* Top row: badge + number */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-2xs font-bold text-brand-foreground">
                              {idx + 1}
                            </span>
                            <Badge
                              variant="outline"
                              className="border-brand/25 bg-brand-soft text-2xs font-medium text-brand"
                            >
                              {item.type}
                            </Badge>
                          </div>
                          <span className="shrink-0 text-2xs text-content-muted/60">
                            {item.language}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 
                          className="mb-1.5 flex cursor-pointer flex-col gap-2 text-base font-bold leading-snug text-content transition-colors hover:text-brand sm:flex-row sm:items-start md:text-base"
                          onClick={() => item.content ? setSelectedArticle(item) : null}
                        >
                          <span>{item.title}</span>
                          {item.content && (
                            <span className="mt-0.5 shrink-0 rounded-full border border-brand/20 bg-brand-soft px-2 py-0.5 text-3xs font-medium text-brand">
                              อ่านเนื้อหาเต็ม
                            </span>
                          )}
                        </h2>

                        {/* Authors */}
                        <p className="mb-2 text-caption font-medium text-brand/80">
                          {item.authors}
                        </p>

                        {/* Journal & Year */}
                        <p className="mb-3 text-xs text-content-muted">
                          {item.journal} ({item.year})
                        </p>

                        {/* Abstract */}
                        <div className="mb-4 line-clamp-2 text-caption leading-relaxed text-content-muted">
                          <span className="font-semibold text-content/70">
                            บทคัดย่อ:
                          </span>{" "}
                          {item.abstract}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 border-t border-outline/40 pt-3.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 px-2.5 text-2xs text-content-muted hover:text-content"
                          >
                            <Bookmark className="w-3.5 h-3.5" /> บันทึก
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 px-2.5 text-2xs text-content-muted hover:text-content"
                          >
                            <span className="material-symbols-outlined text-caption">
                              format_quote
                            </span>{" "}
                            อ้างอิง
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 px-2.5 text-2xs text-danger hover:bg-danger/10 hover:text-danger"
                          >
                            <FileText className="w-3.5 h-3.5" /> PDF
                          </Button>

                          <div className="ml-auto flex items-center gap-1 text-2xs text-content-muted/60">
                            <span className="material-symbols-outlined text-caption">
                              link
                            </span>
                            DOI:{" "}
                            <a
                              href={`https://doi.org/${item.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-info hover:underline"
                            >
                              {item.doi}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-outline bg-surface-raised p-12 text-center shadow-sm">
                    <BookOpen className="mx-auto mb-4 size-12 text-content-muted/20" />
                    <h3 className="mb-2 text-lg font-bold text-content">
                      ไม่พบผลการค้นหา
                    </h3>
                    <p className="text-sm text-content-muted">
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
                    className="size-8 rounded-lg text-content-muted"
                    disabled
                  >
                    <span className="material-symbols-outlined text-sm">
                      chevron_left
                    </span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="size-8 rounded-lg bg-brand text-brand-foreground hover:bg-brand-strong"
                  >
                    1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="size-8 rounded-lg"
                  >
                    2
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="size-8 rounded-lg"
                  >
                    3
                  </Button>
                  <span className="px-1.5 text-sm text-content-muted">
                    …
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="size-8 rounded-lg"
                  >
                    125
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 rounded-lg text-content-muted"
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
          <DialogHeader className="shrink-0 border-b border-outline pb-4">
            <DialogTitle className="pr-8 text-xl leading-tight text-brand md:text-2xl">
              {selectedArticle?.title}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm font-medium text-content">
              <span className="text-content-muted">ผู้แต่ง:</span> {selectedArticle?.authors}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4 pr-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-content-muted">
              {selectedArticle?.content}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}
