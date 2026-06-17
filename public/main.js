document.addEventListener('DOMContentLoaded', () => {
  // 1. Header Scroll Effect
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 2. Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // 3. Scroll Reveal Animations
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const revealOnScroll = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Stop observing once revealed
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
      revealOnScroll.observe(element);
    });
  }

  // 4. Interactive Booking Calculator
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    const roomSelect = document.getElementById('roomType');
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    // Auto-select room from query parameter if provided
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam && roomSelect) {
      const options = Array.from(roomSelect.options).map(opt => opt.value);
      if (options.includes(roomParam)) {
        roomSelect.value = roomParam;
      }
    }
    
    const summaryRoom = document.getElementById('summaryRoom');
    const summaryRate = document.getElementById('summaryRate');
    const summaryNights = document.getElementById('summaryNights');
    const summaryTotal = document.getElementById('summaryTotal');

    const roomRates = {
      'Machaka Malika': 6000,
      'Purathala Malika': 6000,
      'Vadakkara': 7500,
      'Machakam': 7500,
      'Purathalam': 7500
    };

    // Set default min dates (today and tomorrow)
    const today = new Date().toISOString().split('T')[0];
    if (checkinInput) checkinInput.min = today;
    
    if (checkinInput && checkoutInput) {
      checkinInput.addEventListener('change', () => {
        const nextDay = new Date(checkinInput.value);
        nextDay.setDate(nextDay.getDate() + 1);
        checkoutInput.min = nextDay.toISOString().split('T')[0];
        if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
          checkoutInput.value = checkoutInput.min;
        }
        calculateBooking();
      });

      checkoutInput.addEventListener('change', calculateBooking);
    }

    if (roomSelect) {
      roomSelect.addEventListener('change', calculateBooking);
    }

    // Auto calculate booking costs if all params set
    function calculateBooking() {
      if (!roomSelect || !checkinInput || !checkoutInput) return;
      
      const selectedRoom = roomSelect.value;
      const rate = roomRates[selectedRoom] || 0;
      
      if (summaryRoom) summaryRoom.textContent = selectedRoom || 'None Select';
      if (summaryRate) summaryRate.textContent = rate ? `₹${rate}` : '₹0';

      const checkinDate = new Date(checkinInput.value);
      const checkoutDate = new Date(checkoutInput.value);

      if (checkinInput.value && checkoutInput.value && checkoutDate > checkinDate) {
        const diffTime = Math.abs(checkoutDate - checkinDate);
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const total = nights * rate;

        if (summaryNights) summaryNights.textContent = `${nights} ${nights === 1 ? 'Night' : 'Nights'}`;
        if (summaryTotal) summaryTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
      } else {
        if (summaryNights) summaryNights.textContent = '0 Nights';
        if (summaryTotal) summaryTotal.textContent = '₹0';
      }
    }

    // Initialize calculator details
    calculateBooking();

    // Handle Form Submit -> Redirect to WhatsApp
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const room = roomSelect.value;
      const checkin = checkinInput.value;
      const checkout = checkoutInput.value;
      const guests = document.getElementById('guests').value;
      const remarks = document.getElementById('remarks').value.trim();

      const rate = roomRates[room] || 0;
      const checkinDate = new Date(checkin);
      const checkoutDate = new Date(checkout);
      let nights = 0;
      let total = 0;

      if (checkin && checkout && checkoutDate > checkinDate) {
        const diffTime = Math.abs(checkoutDate - checkinDate);
        nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        total = nights * rate;
      }

      // Format WhatsApp Message
      let msg = `*Booking Inquiry: K.R. Thekkedathu Mana*\n\n`;
      msg += `*Guest Details:*\n`;
      msg += `- Name: ${name}\n`;
      msg += `- Phone: ${phone}\n`;
      msg += `- Email: ${email}\n\n`;
      msg += `*Reservation Details:*\n`;
      msg += `- Room Type: ${room}\n`;
      msg += `- Check-in Date: ${checkin}\n`;
      msg += `- Check-out Date: ${checkout}\n`;
      msg += `- Guests Count: ${guests} Person(s)\n`;
      msg += `- Stay Duration: ${nights} Night(s)\n`;
      msg += `- Estimated Price: ₹${total.toLocaleString('en-IN')}\n\n`;
      
      if (remarks) {
        msg += `*Special Requests:*\n${remarks}`;
      } else {
        msg += `*Special Requests:* None`;
      }

      // WhatsApp API redirect link
      const whatsappNumber = '918943227722'; // Country code 91 + number
      const encodedMsg = encodeURIComponent(msg);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;

      // Open in new tab
      window.open(whatsappUrl, '_blank');
    });
  }

  // 5. Gallery Lightbox Functionality
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.querySelector('.lightbox-modal');
  
  if (galleryItems.length > 0 && lightboxModal) {
    const lightboxImg = lightboxModal.querySelector('.lightbox-img');
    const lightboxCaption = lightboxModal.querySelector('.lightbox-caption');
    const lightboxClose = lightboxModal.querySelector('.lightbox-close');
    const lightboxPrev = lightboxModal.querySelector('.lightbox-prev');
    const lightboxNext = lightboxModal.querySelector('.lightbox-next');
    
    let currentIndex = 0;
    const imagesList = Array.from(galleryItems).map(item => {
      const img = item.querySelector('img');
      const captionText = item.querySelector('.gallery-item-overlay span')?.textContent || 'KR Thekkedathu Mana';
      return {
        src: img.src,
        caption: captionText
      };
    });

    const openLightbox = (index) => {
      currentIndex = index;
      lightboxImg.src = imagesList[currentIndex].src;
      lightboxCaption.textContent = imagesList[currentIndex].caption;
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock body scroll
    };

    const closeLightbox = () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = ''; // Unlock body scroll
    };

    const showPrev = () => {
      currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
      lightboxImg.src = imagesList[currentIndex].src;
      lightboxCaption.textContent = imagesList[currentIndex].caption;
    };

    const showNext = () => {
      currentIndex = (currentIndex + 1) % imagesList.length;
      lightboxImg.src = imagesList[currentIndex].src;
      lightboxCaption.textContent = imagesList[currentIndex].caption;
    };

    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);
    if (lightboxNext) lightboxNext.addEventListener('click', showNext);

    // Close on click outside the image
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal || e.target.classList.contains('lightbox-content-wrap')) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightboxModal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });
  }
});
