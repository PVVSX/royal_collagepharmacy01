"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen, Bookmark, FileText, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { researchData, type ResearchArticle } from "@/roles/member/features/research/data/research";
import { ResearchSubmissionDialog } from "@/roles/member/features/research/components/ResearchSubmissionDialog";
import { ResearchSubmissionPanel } from "@/roles/member/features/research/components/ResearchSubmissionPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMockDb } from "@/providers/mock-db-provider";
import { approvedResearchArticles } from "@/roles/shared/features/research/projection";
import type { ResearchSubmission } from "@/roles/shared/features/research/types";

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
  "h-11 w-full rounded-xl border border-outline bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30";

export default function ResearchPage() {
  const { researchSubmissions } = useMockDb();
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
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<ResearchSubmission>();

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
    let results = [
      ...approvedResearchArticles(researchSubmissions),
      ...researchData,
    ];

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
    researchSubmissions,
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
              className="group flex min-h-11 cursor-pointer items-center gap-2.5"
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
              className="group flex min-h-11 cursor-pointer items-center gap-2.5"
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
            aria-label="ปีเริ่มต้น"
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
            aria-label="ปีสิ้นสุด"
            placeholder="ปีสิ้นสุด"
            className={filterInputClass}
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
          />
        </div>
      </div>

      {/* Language */}
      <div>
        <h3 className="mb-2.5 text-caption font-bold text-content">ภาษา</h3>
        <div className="space-y-2">
          {LANGUAGES.map((lang, i) => (
            <label
              key={i}
              className="group flex min-h-11 cursor-pointer items-center gap-2.5"
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
              className="group flex min-h-11 cursor-pointer items-center gap-2.5"
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
            <form
              onSubmit={handleSearch}
              role="search"
              aria-label="ค้นหางานวิจัยและบทความวิชาการ"
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <label htmlFor="research-search" className="sr-only">คำค้นหางานวิจัย</label>
                <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-content-muted" />
                <input
                  id="research-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="พิมพ์คำค้นหา เช่น warfarin, เภสัชกรรมคลินิก..."
                  className="h-11 w-full rounded-xl border-0 bg-surface-raised pl-10 pr-12 text-sm text-content shadow-lg placeholder:text-content-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-foreground/40"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="ล้างคำค้นหา"
                    className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-content-muted transition-colors hover:text-content focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                className="h-11 rounded-xl border border-brand-foreground/20 bg-brand-foreground/15 px-6 font-semibold text-brand-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-brand-foreground/25"
              >
                <Search aria-hidden="true" className="mr-2 h-4 w-4" />
                ค้นหา
              </Button>
            </form>
          </div>
        </div>

        <ResearchSubmissionPanel
          onCreate={() => {
            setEditingSubmission(undefined);
            setSubmissionOpen(true);
          }}
          onEdit={(submission) => {
            setEditingSubmission(submission);
            setSubmissionOpen(true);
          }}
        />

        {/* ── Content Area ── */}
        <div className="px-2 md:px-4">
          <div className="flex gap-5">
            {/* ── Desktop Filter Sidebar ── */}
            <aside className="hidden lg:block w-[260px] shrink-0">
              <div className="sticky top-24 overflow-hidden rounded-xl border border-outline/60 bg-surface-raised shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-outline/50 bg-surface/30 px-4 py-3.5">
                  <div className="flex items-center gap-2 text-caption font-bold text-brand">
                    <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
                    จำกัดผลการค้นหา
                  </div>
                  {activeFilterCount > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={clearAllFilters}
                      className="min-h-11 px-2 text-sm text-destructive hover:bg-danger-soft hover:text-destructive"
                    >
                      ล้างทั้งหมด
                    </Button>
                  )}
                </div>

                {/* Scrollable filter body */}
                <div className="px-4 py-4 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
                  {filterContent}
                </div>
              </div>
            </aside>

            {/* ── Mobile Filter Toggle ── */}
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <div className="fixed bottom-6 right-6 z-50 lg:hidden">
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    className="size-12 rounded-full bg-brand text-brand-foreground shadow-xl hover:bg-brand-strong"
                    size="icon"
                    aria-label={`เปิดตัวกรอง${activeFilterCount > 0 ? ` (${activeFilterCount} รายการที่เลือก)` : ""}`}
                    aria-expanded={mobileFilterOpen}
                    aria-controls="research-mobile-filters"
                  >
                    <SlidersHorizontal aria-hidden="true" className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                {activeFilterCount > 0 && (
                  <span aria-hidden="true" className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-danger text-3xs font-bold text-destructive-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <SheetContent
                id="research-mobile-filters"
                side="bottom"
                showCloseButton={false}
                className="max-h-[80vh] overflow-hidden rounded-t-2xl border-outline bg-surface-raised p-0 lg:hidden"
              >
                <SheetHeader className="border-b border-outline px-5 py-4 text-left">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <SheetTitle className="font-bold text-15">
                        ตัวกรอง ({activeFilterCount})
                      </SheetTitle>
                      <SheetDescription className="mt-1 text-xs">
                        เลือกเงื่อนไขเพื่อจำกัดผลการค้นหา
                      </SheetDescription>
                    </div>
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 shrink-0 rounded-xl"
                        aria-label="ปิดตัวกรอง"
                      >
                        <X aria-hidden="true" className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>
                </SheetHeader>
                <div className="max-h-[65vh] overflow-y-auto px-5 py-4 custom-scrollbar">
                  {filterContent}
                </div>
              </SheetContent>
            </Sheet>

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
                  <label htmlFor="research-sort" className="whitespace-nowrap text-content-muted">
                    เรียงตาม:
                  </label>
                  <select
                    id="research-sort"
                    className="h-11 cursor-pointer rounded-xl border border-outline bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
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
                        <h2 className="mb-1.5 text-base font-bold leading-snug text-content md:text-17">
                          {item.content ? (
                            <button
                              type="button"
                              onClick={() => setSelectedArticle(item)}
                              className="flex w-full flex-col gap-2 rounded-sm text-left transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-row sm:items-start"
                              aria-label={`อ่านเนื้อหาเต็ม ${item.title}`}
                            >
                              <span>{item.title}</span>
                              <span className="mt-0.5 shrink-0 rounded-full border border-brand/20 bg-brand-soft px-2 py-0.5 text-3xs font-medium text-brand">
                                อ่านเนื้อหาเต็ม
                              </span>
                            </button>
                          ) : (
                            <span>{item.title}</span>
                          )}
                        </h2>

                        {/* Authors */}
                        <p className="mb-2 text-caption font-medium text-brand/80">
                          {item.authors}
                        </p>

                        {/* Journal & Year */}
                        <p className="mb-3 text-12 text-content-muted">
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
                          {item.pdfUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1.5 px-2.5 text-2xs text-danger hover:bg-danger/10 hover:text-danger"
                            >
                              <FileText className="w-3.5 h-3.5" /> PDF
                            </Button>
                          )}

                          {item.doi.trim() && (
                            <div className="ml-auto flex items-center gap-1 text-2xs text-content-muted/60">
                              <span className="material-symbols-outlined text-caption">
                                link
                              </span>
                              DOI:{" "}
                              <a
                                href={`https://doi.org/${item.doi.trim()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-info hover:underline"
                              >
                                {item.doi.trim()}
                              </a>
                            </div>
                          )}
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

      <ResearchSubmissionDialog
        key={editingSubmission?.id ?? "new-research-submission"}
        open={submissionOpen}
        submission={editingSubmission}
        onOpenChange={(open) => {
          setSubmissionOpen(open);
          if (!open) setEditingSubmission(undefined);
        }}
      />

    </>
  );
}
