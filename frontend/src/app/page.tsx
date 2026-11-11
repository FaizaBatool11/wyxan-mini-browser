"use client";

import { useEffect, useRef, useState } from "react";

interface Person {
  _id: string;
  name: string;
}

interface Site {
  _id: string;
  title: string;
  address: string;
  html: string;
  author: {
    _id: string;
    name: string;
  };
}

interface Visit {
  _id: string;
  visitedAt: string;
  navigationType: string;
  site: {
    _id: string;
    title: string;
    address: string;
  };
}

interface SearchResult {
  _id: string;
  title: string;
  address: string;
  author: {
    _id: string;
    name: string;
  };
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const primaryButton =
  "rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40";

export default function Home() {
  const [address, setAddress] = useState("http://techworld.test");
  const [person, setPerson] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [site, setSite] = useState<Site | null>(null);
  const [history, setHistory] = useState<Visit[]>([]);

  // Search states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Publish states
  const [publishTitle, setPublishTitle] = useState("");
  const [publishAddress, setPublishAddress] = useState("");
  const [publishHtml, setPublishHtml] = useState("");
  const [publishAuthor, setPublishAuthor] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");
  const [publishError, setPublishError] = useState("");

  const [peopleLoading, setPeopleLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [peopleError, setPeopleError] = useState("");
  const [historyError, setHistoryError] = useState("");

  // Browser navigation stack
  const historyStack = useRef<string[]>([]);
  const historyIndex = useRef(-1);

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const updateNavigationButtons = () => {
    setCanGoBack(historyIndex.current > 0);
    setCanGoForward(
      historyIndex.current < historyStack.current.length - 1
    );
  };

  // Fetch people
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch("http://localhost:4000/people");

        if (!response.ok) {
          throw new Error("Failed to fetch people");
        }

        const data: Person[] = await response.json();
        setPeople(data);
      } catch {
        setPeopleError("Unable to load people from backend");
      } finally {
        setPeopleLoading(false);
      }
    };

    fetchPeople();
  }, []);

  // Fetch browsing history
  const fetchHistory = async (personId: string) => {
    try {
      const response = await fetch(
        `http://localhost:4000/visits/person/${personId}`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch history");
      }

      const data: Visit[] = await response.json();
      setHistory(data);
      setHistoryError("");

      return data;
    } catch {
      setHistoryError("Unable to load browsing history");
      setHistory([]);
      return [];
    }
  };

  // Save visit in MongoDB
  const saveVisit = async (
    personId: string,
    siteId: string,
    navigationType: string
  ) => {
    try {
      const response = await fetch("http://localhost:4000/visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          person: personId,
          site: siteId,
          navigationType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save visit");
      }

      await fetchHistory(personId);
    } catch {
      setHistoryError("Website opened, but visit could not be saved.");
    }
  };

  // Validate fictional website address
  const getValidAddress = (value: string) => {
    const enteredAddress = value.trim();

    const normalizedAddress =
      enteredAddress.startsWith("http://") ||
      enteredAddress.startsWith("https://")
        ? enteredAddress
        : `http://${enteredAddress}`;

    const url = new URL(normalizedAddress);

    if (
      !["http:", "https:"].includes(url.protocol) ||
      !url.hostname.endsWith(".test")
    ) {
      throw new Error("Only fictional .test websites are allowed");
    }

    const pathname =
      url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");

    return `${url.protocol}//${url.host}${pathname}${url.search}${url.hash}`;
  };

  // Navigate to website
  const navigateTo = async (
    value: string,
    navigationType = "typed",
    addToStack = true,
    personId = person,
    shouldSaveVisit = true
  ) => {
    if (!personId) {
      setError("Please select a person before browsing.");
      setSite(null);
      return;
    }

    let websiteAddress: string;

    try {
      websiteAddress = getValidAddress(value);
    } catch {
      setSite(null);
      setError("Only fictional .test websites are allowed.");
      return;
    }

    setAddress(websiteAddress);
    setLoading(true);
    setError("");
    setSite(null);

    try {
      const response = await fetch(
        `http://localhost:4000/sites/by-address?address=${encodeURIComponent(
          websiteAddress
        )}`
      );

      if (!response.ok) {
        throw new Error("Website not found");
      }

      const data: Site = await response.json();

      setSite(data);

      if (addToStack) {
        const updatedStack = historyStack.current.slice(
          0,
          historyIndex.current + 1
        );

        updatedStack.push(data.address);

        historyStack.current = updatedStack;
        historyIndex.current = updatedStack.length - 1;

        updateNavigationButtons();
      }

      if (shouldSaveVisit) {
        await saveVisit(personId, data._id, navigationType);
      }
    } catch {
      setError("Website not found. Please check the address.");
    } finally {
      setLoading(false);
    }
  };

  // Search websites
  const handleSearch = async () => {
    const keyword = searchKeyword.trim();

    if (!keyword) {
      setSearchError("Please enter a keyword to search.");
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError("");
    setSearchResults([]);

    try {
      const response = await fetch(
        `http://localhost:4000/sites/search?keyword=${encodeURIComponent(
          keyword
        )}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data: SearchResult[] = await response.json();

      setSearchResults(data);

      if (data.length === 0) {
        setSearchError("No matching websites found.");
      }
    } catch {
      setSearchError("Unable to search websites. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Open a search result
  const handleSearchResult = (resultAddress: string) => {
    navigateTo(resultAddress, "search");
  };

  // Publish website
  const handlePublish = async () => {
    setPublishMessage("");
    setPublishError("");

    if (
      !publishTitle.trim() ||
      !publishAddress.trim() ||
      !publishHtml.trim() ||
      !publishAuthor
    ) {
      setPublishError("Please fill in all fields.");
      return;
    }

    let validAddress: string;

    try {
      validAddress = getValidAddress(publishAddress);
    } catch {
      setPublishError("Please enter a valid fictional .test address.");
      return;
    }

    setPublishLoading(true);

    try {
      const response = await fetch("http://localhost:4000/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: publishTitle.trim(),
          address: validAddress,
          html: publishHtml,
          author: publishAuthor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to publish website."
        );
      }

      setPublishMessage("Website published successfully!");

      setPublishTitle("");
      setPublishAddress("");
      setPublishHtml("");

      await navigateTo(
        validAddress,
        "typed",
        true,
        publishAuthor
      );
    } catch (error) {
      setPublishError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setPublishLoading(false);
    }
  };

  // Go button
  const handleGo = () => {
    navigateTo(address, "typed");
  };

  // Enter key in address bar
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleGo();
    }
  };

  // Enter key in search box
  const handleSearchKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Back button
  const handleBack = () => {
    if (!canGoBack) return;

    historyIndex.current -= 1;
    updateNavigationButtons();

    const previousAddress =
      historyStack.current[historyIndex.current];

    navigateTo(previousAddress, "back", false);
  };

  // Forward button
  const handleForward = () => {
    if (!canGoForward) return;

    historyIndex.current += 1;
    updateNavigationButtons();

    const nextAddress =
      historyStack.current[historyIndex.current];

    navigateTo(nextAddress, "forward", false);
  };

  // Change person
  const handlePersonChange = async (personId: string) => {
    setPerson(personId);
    setSite(null);
    setError("");
    setAddress("");
    setSearchResults([]);
    setSearchError("");

    historyStack.current = [];
    historyIndex.current = -1;
    updateNavigationButtons();

    setHistory([]);

    if (!personId) return;

    const visits = await fetchHistory(personId);

    const chronologicalVisits = [...visits]
      .filter((visit) => visit.site?.address)
      .reverse();

    const addresses = chronologicalVisits.map(
      (visit) => visit.site.address
    );

    historyStack.current = addresses;
    historyIndex.current = addresses.length - 1;

    updateNavigationButtons();

    if (addresses.length > 0) {
      const latestAddress = addresses[addresses.length - 1];

      await navigateTo(
        latestAddress,
        "history",
        false,
        personId,
        false
      );
    }
  };

  // Open website from history
  const handleHistoryClick = (historyAddress: string) => {
    navigateTo(historyAddress, "history");
  };

  // Handle iframe links
  const handleIframeLoad = (
    event: React.SyntheticEvent<HTMLIFrameElement>
  ) => {
    const iframe = event.currentTarget;
    const frameDocument = iframe.contentDocument;

    if (!frameDocument) return;

    frameDocument.addEventListener(
      "click",
      (clickEvent: MouseEvent) => {
        const target = clickEvent.target as HTMLElement | null;
        const anchor = target?.closest("a");

        if (!anchor) return;

        clickEvent.preventDefault();
        clickEvent.stopPropagation();

        const href = anchor.getAttribute("href");

        if (!href || href.startsWith("#")) return;

        try {
          const destination = new URL(href, address);

          if (
            !["http:", "https:"].includes(destination.protocol) ||
            !destination.hostname.endsWith(".test")
          ) {
            setError("Only fictional .test websites are allowed.");
            setSite(null);
            return;
          }

          navigateTo(destination.href, "link");
        } catch {
          setError("Invalid website address.");
          setSite(null);
        }
      },
      true
    );
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* Header */}
      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl shadow-lg shadow-blue-900/30">
              🌐
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Mini Browser
              </h1>
              <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                Your fictional web experience
              </p>
            </div>
          </div>

          <div className="hidden rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs text-slate-300 sm:block">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
            Local browsing environment
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-8 sm:py-8">

        {/* Browser Toolbar */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Browser Controls
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Navigate through fictional websites
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              .test websites only
            </span>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex gap-2">
              <button
                onClick={handleBack}
                disabled={!canGoBack || loading}
                title="Go Back"
                className={secondaryButton}
              >
                ←
                <span className="ml-2 hidden sm:inline">Back</span>
              </button>

              <button
                onClick={handleForward}
                disabled={!canGoForward || loading}
                title="Go Forward"
                className={secondaryButton}
              >
                →
                <span className="ml-2 hidden sm:inline">Forward</span>
              </button>

              <button
                onClick={handleGo}
                disabled={loading || !person}
                title="Refresh"
                className={secondaryButton}
              >
                ↻
              </button>
            </div>

            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔒
              </span>

              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a fictional website address..."
                className={`${inputClass} pl-11`}
              />
            </div>

            <button
              onClick={handleGo}
              disabled={loading || !person}
              className={primaryButton}
            >
              {loading ? "Loading..." : "Go to Website →"}
            </button>
          </div>
        </section>

        {/* Main Dashboard */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">

          {/* Sidebar */}
          <aside className="space-y-6">

            {/* People */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                  👥
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    People
                  </h2>
                  <p className="text-xs text-slate-400">
                    Choose a browsing profile
                  </p>
                </div>
              </div>

              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Browse as
              </label>

              {peopleLoading ? (
                <p className="text-sm text-slate-500">
                  Loading people...
                </p>
              ) : peopleError ? (
                <p className="text-sm text-red-600">
                  {peopleError}
                </p>
              ) : (
                <select
                  value={person}
                  onChange={(e) => handlePersonChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a person</option>

                  {people.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}

              {person && (
                <div className="mt-4 rounded-xl bg-blue-50 p-3">
                  <p className="text-xs font-medium text-blue-600">
                    Active profile
                  </p>

                  <p className="mt-1 text-sm font-bold text-blue-950">
                    {people.find((item) => item._id === person)?.name}
                  </p>
                </div>
              )}
            </section>

            {/* Browsing History */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg">
                    🕘
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-800">
                      Browsing History
                    </h2>
                    <p className="text-xs text-slate-400">
                      Previous visits
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {history.length}
                </span>
              </div>

              {!person ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  Select a person to view their browsing history.
                </p>
              ) : historyError ? (
                <p className="text-sm text-red-600">
                  {historyError}
                </p>
              ) : history.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No browsing history found.
                </p>
              ) : (
                <div className="max-h-[550px] space-y-2 overflow-y-auto pr-1">
                  {history.map((visit) => (
                    <button
                      key={visit._id}
                      onClick={() =>
                        handleHistoryClick(visit.site.address)
                      }
                      className="w-full rounded-xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {visit.site.title}
                      </p>

                      <p className="mt-1 break-all text-xs text-slate-500">
                        {visit.site.address}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400">
                          {new Date(visit.visitedAt).toLocaleString()}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600">
                          {visit.navigationType}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </aside>

          {/* Main Content */}
          <div className="min-w-0 space-y-6">

            {/* Search */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  🔎
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Search Websites
                  </h2>
                  <p className="text-sm text-slate-500">
                    Find websites by their content
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Try searching artificial intelligence, recipes, cricket..."
                  className={inputClass}
                />

                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className={primaryButton}
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </div>

              {searchError && (
                <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {searchError}
                </p>
              )}

              {searchResults.length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800">
                      Search Results
                    </h3>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {searchResults.length} found
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {searchResults.map((result) => (
                      <button
                        key={result._id}
                        onClick={() =>
                          handleSearchResult(result.address)
                        }
                        className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        <p className="font-semibold text-blue-700">
                          {result.title}
                        </p>

                        <p className="mt-1 break-all text-xs text-slate-500">
                          {result.address}
                        </p>

                        <p className="mt-3 text-xs text-slate-400">
                          Author: {result.author?.name || "Unknown"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
            
          {/* Website Display */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div>
                  <h2 className="font-bold text-slate-800">
                    Website Preview
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Browse selected website content
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                  Live preview
                </span>
              </div>

              <div className="p-4 sm:p-5">
                {loading ? (
                  <div className="flex min-h-[400px] flex-col items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                    <p className="mt-4 text-sm font-medium text-slate-600">
                      Loading website...
                    </p>
                  </div>
                ) : error ? (
                  <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-red-50 p-6 text-center">
                    <div className="text-5xl">⚠️</div>

                    <h2 className="mt-4 text-xl font-bold text-red-700">
                      Website Not Found
                    </h2>

                    <p className="mt-2 max-w-md text-sm text-red-600">
                      {error}
                    </p>
                  </div>
                ) : site ? (
                  <>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Currently viewing
                        </p>

                        <h2 className="mt-1 truncate text-lg font-bold text-slate-900">
                          {site.title}
                        </h2>

                        <p className="mt-1 break-all text-xs text-blue-600">
                          {site.address}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Published by: {site.author?.name || "Unknown"}
                        </p>
                      </div>

                      <span className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">
                        Website loaded
                      </span>
                    </div>

                    <iframe
                      key={site._id}
                      title={site.title}
                      srcDoc={site.html}
                      sandbox="allow-same-origin"
                      onLoad={handleIframeLoad}
                      referrerPolicy="no-referrer"
                      className="min-h-[500px] w-full rounded-xl border border-slate-200 bg-white"
                    />
                  </>
                ) : (
                  <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-slate-50 px-5 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-4xl">
                      🌐
                    </div>

                    <h2 className="mt-5 text-2xl font-bold text-slate-900">
                      Welcome to Mini Browser
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Select a person, enter a fictional website
                      address and start exploring your web experience.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Publish */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">
                  ✍️
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Publish a Website
                  </h2>
                  <p className="text-sm text-slate-500">
                    Create and publish your own fictional website
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Website Title
                  </label>

                  <input
                    type="text"
                    value={publishTitle}
                    onChange={(e) => setPublishTitle(e.target.value)}
                    placeholder="My New Website"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Website Address
                  </label>

                  <input
                    type="text"
                    value={publishAddress}
                    onChange={(e) =>
                      setPublishAddress(e.target.value)
                    }
                    placeholder="http://mywebsite.test"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Select Author
                  </label>

                  <select
                    value={publishAuthor}
                    onChange={(e) =>
                      setPublishAuthor(e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select an author</option>

                    {people.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    HTML Content
                  </label>

                  <textarea
                    value={publishHtml}
                    onChange={(e) =>
                      setPublishHtml(e.target.value)
                    }
                    placeholder={"<html>\n<body>\n  <h1>Hello World</h1>\n  <p>My website content</p>\n</body>\n</html>"}
                    rows={8}
                    className={`${inputClass} resize-y font-mono text-xs leading-6`}
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Add your HTML content. Unsafe scripts and elements
                    are removed by the backend.
                  </p>
                </div>
              </div>

              {publishMessage && (
                <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  ✓ {publishMessage}
                </p>
              )}

              {publishError && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {publishError}
                </p>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  onClick={handlePublish}
                  disabled={publishLoading}
                  className={primaryButton}
                >
                  {publishLoading
                    ? "Publishing..."
                    : "Publish Website →"}
                </button>
              </div>
            </section>
            
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t border-slate-200 py-6 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Mini Browser
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Fictional Web Experience · Built with Next.js, NestJS
            and MongoDB
          </p>
        </footer>
      </div>
    </main>
  );
}
