document.addEventListener("DOMContentLoaded", () => {

  // ----- Global States -----
  let isCarouselEnabled = true; // NEW: Toggle for carousel logic

  // ----- Intersection Observer for scroll animations -----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle("visible", entry.isIntersecting);
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.fade-left, .fade-right, .fade-up, .experience')
    .forEach(el => observer.observe(el));

  // ----- Hero button scroll -----
  const hero = document.querySelector(".hero");
  const about = document.querySelector("#upcoming");
  const vpBtn = document.querySelector(".hero .btn");

  if (vpBtn && hero && about) {
    vpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      hero.classList.add("fade-out");

      setTimeout(() => {
        window.scrollTo(0, about.offsetTop);
        about.classList.add("fade-in");

        setTimeout(() => {
          hero.classList.remove("fade-out");
          hero.classList.add("fade-in");
          setTimeout(() => hero.classList.remove("fade-in"), 900);
        }, 1200);
      }, 600);
    });
  }

  // ----- Scroll to top when clicking logo -----
  const logo = document.querySelector(".navbar .logo");
  if (logo) {
    logo.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // ----- Carousel -----
  const track = document.querySelector('.carousel-track');
  const nextButton = document.querySelector('.next');
  const prevButton = document.querySelector('.prev');

  let slides, slideWidth, currentIndex;
  let isMoving = false; // prevent fast clicks

  function getVisibleCards() {
    return window.innerWidth <= 768 ? 1 : 3;
  }

  function setupCarousel() {
    // Remove old clones
    document.querySelectorAll('.clone').forEach(el => el.remove());

    const realSlides = Array.from(document.querySelectorAll('.auction-card'));
    const visible = getVisibleCards();

    const firstClones = realSlides.slice(0, visible).map(slide => {
      const clone = slide.cloneNode(true);
      clone.classList.add('clone');
      return clone;
    });
    const lastClones = realSlides.slice(-visible).map(slide => {
      const clone = slide.cloneNode(true);
      clone.classList.add('clone');
      return clone;
    });

    lastClones.forEach(clone => track.prepend(clone));
    firstClones.forEach(clone => track.append(clone));

    slides = Array.from(track.children);
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || 0);

    slideWidth = slides[0].getBoundingClientRect().width + gap;

    currentIndex = visible;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
  }

  function moveToSlide(animate = true) {
    track.style.transition = animate ? 'transform 0.4s ease-in-out' : 'none';
    track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
    if (animate) isMoving = true;
  }

  // UPDATED: Added isCarouselEnabled check
  function nextSlide() {
    if (isMoving || !isCarouselEnabled) return;
    currentIndex++;
    moveToSlide(true);
  }

  // UPDATED: Added isCarouselEnabled check
  function prevSlide() {
    if (isMoving || !isCarouselEnabled) return;
    currentIndex--;
    moveToSlide(true);
  }

  nextButton.addEventListener('click', nextSlide);
  prevButton.addEventListener('click', prevSlide);

  track.addEventListener('transitionend', () => {
    if (!isCarouselEnabled) return; // Don't run loop logic if grid is open
    const visible = getVisibleCards();
    const realCount = slides.length - (visible * 2);

    if (currentIndex >= realCount + visible) {
      track.style.transition = 'none';
      currentIndex -= realCount;
      track.style.transform = `translateX(-${slideWidth * currentIndex}px) `;
    } else if (currentIndex < visible) {
      track.style.transition = 'none';
      currentIndex += realCount;
      track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
    }

    isMoving = false;
  });

  window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (isCarouselEnabled) setupCarousel();
  }, 200);
});
  window.addEventListener('load', setupCarousel);

  // ----- About Section Auto Slider -----
  const aboutTrack = document.querySelector(".about-slider-track");
  const aboutSlides = document.querySelectorAll(".about-slider-track img");

  let aboutIndex = 0;
  function moveAboutSlider() {
    aboutIndex++;
    if (aboutIndex >= aboutSlides.length) {
      aboutIndex = 0;
    }
    if (aboutTrack) aboutTrack.style.transform = `translateX(-${aboutIndex * 100}%)`;
  }
  setInterval(moveAboutSlider, 4000);

  // ----- Login Modal -----
  const loginLink = document.querySelector(".login-link");
  const loginModal = document.querySelector(".login-modal");
  const overlay = document.querySelector(".login-overlay");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const showSignup = document.getElementById("showSignup");
  const showLogin = document.getElementById("showLogin");

  if (loginLink) {
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      loginModal.style.display = "flex";
      loginForm.classList.add("active");
      signupForm.classList.remove("active");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", () => {
      loginModal.style.display = "none";
    });
  }

  if (showSignup) {
    showSignup.addEventListener("click", (e) => {
      e.preventDefault();
      loginForm.classList.remove("active");
      signupForm.classList.add("active");
    });
  }

  if (showLogin) {
    showLogin.addEventListener("click", (e) => {
      e.preventDefault();
      signupForm.classList.remove("active");
      loginForm.classList.add("active");
    });
  }

  document.querySelectorAll(".toggle-password").forEach(toggle => {
    toggle.addEventListener("click", () => {
      const input = document.getElementById(toggle.dataset.target);
      if (input.type === "password") {
        input.type = "text";
        toggle.textContent = "Hide";
      } else {
        input.type = "password";
        toggle.textContent = "Show";
      }
    });
  });

  // ----- UPDATED: View All / Collapse Logic -----
const viewAllBtn = document.getElementById("viewAllBtn");
let isExpanded = false;
let originalSlides = [];

viewAllBtn.addEventListener("click", () => {
  const container = document.querySelector('.carousel-track-container');
  const cards = Array.from(track.children); // all current cards

  if (!isExpanded) {
    // ===== EXPAND =====
    // 1. Fade out each card
    cards.forEach(card => card.classList.add("card-fade"));

    setTimeout(() => {
      // 2. Disable carousel & save state
      isCarouselEnabled = false;
      isExpanded = true;
      originalSlides = Array.from(track.children);

      // 3. Remove clones
      document.querySelectorAll('.clone').forEach(el => el.remove());

      // 4. Layout change
      if (container) container.classList.add("expanded-view");
      track.classList.add("expanded");
      track.style.transition = "none";
      track.style.transform = "none";

      // 5. Set grid columns
      if (window.innerWidth > 1200) track.style.gridTemplateColumns = `repeat(4, 1fr)`;
      else if (window.innerWidth > 900) track.style.gridTemplateColumns = `repeat(3, 1fr)`;
      else if (window.innerWidth > 768) track.style.gridTemplateColumns = `repeat(2, 1fr)`;
      else track.style.gridTemplateColumns = "repeat(1, 1fr)";

      // 6. Hide nav arrows
      if (nextButton) nextButton.style.opacity = "0";
      if (prevButton) prevButton.style.opacity = "0";

      viewAllBtn.textContent = "Collapse";

      // 7. Fade in each card smoothly
      setTimeout(() => {
        cards.forEach(card => {
          card.classList.remove("card-fade");
          card.classList.add("card-fade-in");
        });
        setTimeout(() => cards.forEach(card => card.classList.remove("card-fade-in")), 500);
      }, 50);

    }, 500); // wait for fade-out

  } else {
    // ===== COLLAPSE =====
    cards.forEach(card => card.classList.add("card-fade"));

    setTimeout(() => {
      if (container) container.classList.remove("expanded-view");
      track.classList.remove("expanded");

      // Restore original slides
      track.innerHTML = "";
      const realSlides = originalSlides.filter(slide => !slide.classList.contains('clone'));
      realSlides.forEach(slide => track.appendChild(slide));

      setupCarousel();
      isCarouselEnabled = true;
      isExpanded = false;

      if (nextButton) nextButton.style.opacity = "1";
      if (prevButton) prevButton.style.opacity = "1";

      // Fade in restored cards
      const restoredCards = Array.from(track.children);
      restoredCards.forEach(card => card.classList.add("card-fade"));
      setTimeout(() => {
        restoredCards.forEach(card => {
          card.classList.remove("card-fade");
          card.classList.add("card-fade-in");
        });
        setTimeout(() => restoredCards.forEach(card => card.classList.remove("card-fade-in")), 500);
      }, 50);

      // ----- SCROLL TO UPCOMING AUCTIONS -----
      const upcoming = document.querySelector('#upcoming');
      if (upcoming) {
        const top = upcoming.offsetTop;
        const height = upcoming.offsetHeight;
        const viewportHeight = window.innerHeight;

        const scrollPos = top - (viewportHeight / 2) + (height / 2);

        setTimeout(() => {
          window.scrollTo({ top: scrollPos, behavior: "smooth" });
        }, 50);
      }

      viewAllBtn.textContent = "View All";

    }, 600); // wait for fade-out
  }
});

  // ----- Auction Filters -----
  const auctionSearch = document.getElementById('auctionSearch');
  const categoryFilter = document.getElementById('categoryFilter');
  const typeFilter = document.getElementById('typeFilter');
  const minPrice = document.getElementById('minPrice');
  const maxPrice = document.getElementById('maxPrice');

  function filterAuctions() {
    const searchText = auctionSearch.value.toLowerCase();
    const category = categoryFilter.value;
    const type = typeFilter.value;
    const min = minPrice.value ? parseInt(minPrice.value) : 0;
    const max = maxPrice.value ? parseInt(maxPrice.value) : Infinity;

    // Recapture cards inside filter in case they were moved
    document.querySelectorAll('.auction-card').forEach(card => {
      const img = card.querySelector('img');
      const title = img ? img.alt.toLowerCase() : "";
      const cardCategory = card.dataset.category || "";
      const cardType = card.dataset.type || "";
      const cardPrice = parseInt(card.dataset.price) || 0;

      const matches =
        title.includes(searchText) &&
        (category === "" || cardCategory === category) &&
        (type === "" || cardType === type) &&
        cardPrice >= min &&
        cardPrice <= max;

      card.style.display = matches ? "flex" : "none";
    });
  }

  [auctionSearch, categoryFilter, typeFilter, minPrice, maxPrice].forEach(el => {
    if (el) el.addEventListener('input', filterAuctions);
  });

  // ----- Hero Crossfade -----
  const heroImages = ["hero1.png", "hero2.png", "hero3.png"];
  const overlayA = document.querySelector(".overlay-a");
  const overlayB = document.querySelector(".overlay-b");
  let heroIdx = 0;
  let showingA = true;

  if (overlayA) overlayA.style.background = `url(${heroImages[0]}) center/cover no-repeat`;

  function cycleHero() {
    heroIdx = (heroIdx + 1) % heroImages.length;
    const nextImage = heroImages[heroIdx];

    if (showingA) {
      if (overlayB) {
        overlayB.style.background = `url(${nextImage}) center/cover no-repeat`;
        overlayB.style.opacity = "0.15";
      }
      if (overlayA) overlayA.style.opacity = "0";
    } else {
      if (overlayA) {
        overlayA.style.background = `url(${nextImage}) center/cover no-repeat`;
        overlayA.style.opacity = "0.15";
      }
      if (overlayB) overlayB.style.opacity = "0";
    }
    showingA = !showingA;
  }
  setInterval(cycleHero, 5000);

  // ----- AUCTION POPUP -----
  const popup = document.querySelector(".auction-popup");
  const popupOverlay = document.querySelector(".auction-popup-overlay");
  const popupImage = document.querySelector(".popup-main-image");
  const prevImg = document.querySelector(".prev-img");
  const nextImg = document.querySelector(".next-img");
  const closePopup = document.querySelector(".close-popup");
  const progressBar = document.querySelector(".popup-progress-bar");
  const counter = document.querySelector(".popup-counter");

  let popupImages = [];
  let imgIndex = 0;

  document.querySelectorAll(".view-popup").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const img = btn.dataset.img;
      popupImages = [img, img, img, img, img]; // Replace with dynamic data if needed
      imgIndex = 0;
      if (popup) popup.style.display = "flex";
      updateImage();
    })
  });

  function updateImage() {
    if (popupImage) popupImage.src = popupImages[imgIndex];
    if (counter) counter.textContent = `${imgIndex + 1}/${popupImages.length}`;
    const progress = ((imgIndex + 1) / popupImages.length) * 100;
    if (progressBar) progressBar.style.width = progress + "%";
  }

  if (nextImg) {
    nextImg.addEventListener("click", () => {
      if (imgIndex < popupImages.length - 1) {
        imgIndex++;
        updateImage();
      }
    });
  }

  if (prevImg) {
    prevImg.addEventListener("click", () => {
      if (imgIndex > 0) {
        imgIndex--;
        updateImage();
      }
    });
  }

  if (closePopup) {
    closePopup.addEventListener("click", () => { popup.style.display = "none"; });
  }

  if (popupOverlay) {
    popupOverlay.addEventListener("click", () => { popup.style.display = "none"; });
  }

  function updateAuctionClock() {
  const clock = document.getElementById("auctionClock");
  const now = new Date();

  const hours = String(now.getHours()).padStart(2,"0");
  const minutes = String(now.getMinutes()).padStart(2,"0");
  const seconds = String(now.getSeconds()).padStart(2,"0");

  clock.textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateAuctionClock, 1000);
updateAuctionClock();
});

// ----- MOBILE CARD TAP (clean + controlled) -----
function handleCardTap(e) {
  const card = e.target.closest('.auction-card');

  // Click outside cards → close all
  if (!card) {
    document.querySelectorAll('.auction-card')
      .forEach(c => c.classList.remove('active'));
    return;
  }

  // Ignore button clicks
  if (e.target.closest('.auction-btn')) return;

  // Only run on mobile AND when carousel is active
  if (window.innerWidth <= 768 && isCarouselEnabled) {

    document.querySelectorAll('.auction-card')
      .forEach(c => {
        if (c !== card) c.classList.remove('active');
      });

    card.classList.toggle('active');
  }
}

// Attach once DOM is ready
document.addEventListener('click', handleCardTap);
