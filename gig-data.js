(() => {
  const VENUE_TIME_ZONE = "Australia/Melbourne";
  const ROLLOVER_HOUR = 22;
  const ROLLOVER_MINUTE = 30;
  const WORKING_ON_IT = {
    title: "We Are Working On It",
    buttonLabel: "Next Gig - We Are Working On It",
    image: "images/wereWorkingOnIt.png",
    alt: "We Are Working On It"
  };

  // Edit this list only when adding or changing gigs.
  const gigs = [
    {
      date: "2026-08-07",
      dayDate: "Friday 7th August 2026",
      shortLabel: "Fri Aug 7th",
      onStage: "8 pm",
      venueName: "The Green Room Wine and Whiskey Bar",
      venueShort: "The Green Room",
      address: "94 Pakington St, Geelong West VIC 3218",
      mapsQuery: "The Green Room Wine and Whiskey Bar",
      venueUrl: "https://www.facebook.com/p/The-Green-Room-Wine-Whisky-and-Cocktail-Bar-100043234315014/",
      notes: "Free entry / 3 sets",
      posterThumb: "images/gigs/GreenRoom07082026sml.png",
      posterFull: "images/gigs/GreenRoom07082026sml.png"
    },
    {
      date: "2026-06-12",
      dayDate: "Friday 12th June 2026",
      shortLabel: "Fri June 12th",
      onStage: "8 pm",
      venueName: "The Green Room Wine and Whiskey Bar",
      venueShort: "The Green Room",
      address: "94 Pakington St, Geelong West VIC 3218",
      mapsQuery: "The Green Room Wine and Whiskey Bar",
      venueUrl: "https://www.facebook.com/p/The-Green-Room-Wine-Whisky-and-Cocktail-Bar-100043234315014/",
      notes: "Free entry / 3 sets",
      posterThumb: "images/gigs/GreenRoom12062026sml.png",
      posterFull: "images/gigs/GreenRoom12062026sml.png"
    },
    {
      date: "2026-03-21",
      dayDate: "Saturday 21st March 2026",
      shortLabel: "Sat March 21st",
      onStage: "8 pm",
      venueName: "The Green Room Wine and Whiskey Bar",
      venueShort: "The Green Room",
      address: "94 Pakington St, Geelong West VIC 3218",
      mapsQuery: "The Green Room Wine and Whiskey Bar",
      venueUrl: "https://www.facebook.com/p/The-Green-Room-Wine-Whisky-and-Cocktail-Bar-100043234315014/",
      notes: "Free entry / 3 sets",
      posterThumb: "images/gigs/GreenRoom21032026sml.png",
      posterFull: "images/gigs/GreenRoom21032026sml.png"
    },
    {
      date: "2026-04-03",
      dayDate: "Friday 3rd April 2026",
      shortLabel: "Fri April 3rd",
      onStage: "8 pm",
      venueName: "Bancoora Life Saving Club",
      venueShort: "Bancoora Life Saving Club",
      address: "101 Surf Club Ln, Breamlea VIC",
      mapsQuery: "Bancoora Surf Life Saving Club",
      venueUrl: "https://bancoora.asn.au/",
      notes: "Free entry / 3 sets",
      posterThumb: "images/gigs/Banny03042026.png",
      posterFull: "images/gigs/Banny03042026.png"
    },
    {
      date: "2026-01-07",
      dayDate: "Wed 7th Jan 2026",
      shortLabel: "Wed Jan 7th",
      onStage: "9 pm",
      venueName: "Here & Now Lounge",
      venueShort: "Here & Now Lounge",
      address: "Upstairs, Above Kahn Curry Hut. Level 1, 97-99 Ryrie Street Street Geelong Vic",
      mapsQuery: "Here and Now Lounge Geelong VIC 3220",
      venueUrl: "https://hereandnowlounge.com.au/",
      notes: "Free entry / 2 sets",
      posterThumb: "images/gigs/HereAndNow07012026.png",
      posterFull: "images/gigs/HereAndNow07012026.png",
      photosFolder: "HereAndNowLounge07012026"
    }
  ];

  function parseGigDate(gig) {
    return new Date(`${gig.date}T00:00:00`);
  }

  function getVenueNowParts(now = new Date()) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: VENUE_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    const parts = Object.fromEntries(
      formatter.formatToParts(now)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );
    return {
      isoDate: `${parts.year}-${parts.month}-${parts.day}`,
      hour: Number(parts.hour),
      minute: Number(parts.minute),
      second: Number(parts.second)
    };
  }

  function isPastGig(gig, now = new Date()) {
    const venueNow = getVenueNowParts(now);
    if (gig.date < venueNow.isoDate) return true;
    if (gig.date > venueNow.isoDate) return false;
    if (venueNow.hour > ROLLOVER_HOUR) return true;
    if (venueNow.hour < ROLLOVER_HOUR) return false;
    return venueNow.minute >= ROLLOVER_MINUTE;
  }

  function getUpcomingGigs(now = new Date()) {
    return gigs
      .filter((gig) => !isPastGig(gig, now))
      .sort((a, b) => parseGigDate(a) - parseGigDate(b));
  }

  function getNextGig(now = new Date()) {
    return getUpcomingGigs(now)[0] || null;
  }

  function getSortedGigs(now = new Date()) {
    const upcoming = gigs
      .filter((gig) => !isPastGig(gig, now))
      .sort((a, b) => parseGigDate(a) - parseGigDate(b));
    const past = gigs
      .filter((gig) => isPastGig(gig, now))
      .sort((a, b) => parseGigDate(b) - parseGigDate(a));
    return [...upcoming, ...past];
  }

  function mapsLink(query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function mapsEmbed(query) {
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }

  function renderHomeNextGig(options = {}) {
    const nextGig = getNextGig(options.now);
    const button = document.querySelector(options.buttonSelector || "[data-next-gig-link]");
    const image = document.querySelector(options.imageSelector || "[data-next-gig-image]");

    if (button) {
      button.textContent = nextGig
        ? `Next Gig - ${nextGig.shortLabel} : ${nextGig.venueShort || nextGig.venueName}`
        : WORKING_ON_IT.buttonLabel;
    }

    if (!image) return;

    if (nextGig) {
      image.src = nextGig.posterThumb || nextGig.posterFull;
      image.alt = `${nextGig.shortLabel} - ${nextGig.venueShort || nextGig.venueName}`;
    } else {
      image.src = WORKING_ON_IT.image;
      image.alt = WORKING_ON_IT.alt;
    }
  }

  function renderGigsList(listId, options = {}) {
    const list = document.getElementById(listId);
    if (!list) return [];

    const sortedGigs = getSortedGigs(options.now);
    list.innerHTML = "";

    sortedGigs.forEach((gig, index) => {
      const card = document.createElement("div");
      card.className = "gig-card";
      if (isPastGig(gig, options.now)) {
        card.classList.add("past-gig");
      }

      card.innerHTML = `
        <div class="gig-info">
          <div class="gig-date">${gig.dayDate}</div>
          <div class="gig-venue">${gig.venueName}</div>
          <div class="gig-address">${gig.address}</div>
          ${gig.notes ? `<div class="gig-notes">${gig.notes}</div>` : ""}
          <div class="gig-time">On stage: ${gig.onStage}</div>
          ${gig.venueUrl ? `
            <a class="btn purple" target="_blank" rel="noopener"
               href="${gig.venueUrl}">View Website</a>
          ` : ""}
          ${gig.photosFolder ? `
            <a class="btn photos" href="#" data-photos-folder="${gig.photosFolder}">Photos</a>
          ` : ""}
        </div>
        <div class="gig-media gig-map">
          <iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade"
            src="${mapsEmbed(gig.mapsQuery)}"></iframe>
        </div>
        <div class="gig-media poster-thumb-wrap" data-poster-index="${index}">
          ${gig.posterThumb ? `
            <img src="${gig.posterThumb}" class="poster-thumb" alt="Gig Poster Thumbnail">
            <div class="poster-caption">Tap/click to view full poster</div>
          ` : ""}
        </div>
      `;

      list.appendChild(card);
    });

    return sortedGigs;
  }

  window.FlipSideGigs = {
    gigs,
    workingOnIt: WORKING_ON_IT,
    venueTimeZone: VENUE_TIME_ZONE,
    getNextGig,
    getSortedGigs,
    isPastGig,
    mapsLink,
    mapsEmbed,
    renderHomeNextGig,
    renderGigsList
  };
})();
