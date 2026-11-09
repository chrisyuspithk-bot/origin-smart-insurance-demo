(function () {
  "use strict";

  var navLinks = document.getElementById("nav-links");
  var toggle = document.querySelector(".nav__toggle");
  var form = document.getElementById("enquiry-form");
  var toast = document.getElementById("toast");
  var topicSelect = document.getElementById("f-topic");
  var progressBar = document.querySelector("#progress i");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  function updateProgress() {
    if (!progressBar) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = Math.max(0, Math.min(100, pct)) + "%";
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  // Staggered section entrances
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Soft parallax on hero background (subtle)
  var heroBg = document.querySelector(".hero__bg");
  if (heroBg && !reduceMotion) {
    window.addEventListener("scroll", function () {
      var y = Math.min(window.scrollY, 420);
      heroBg.style.transform = "scale(1.04) translate3d(0," + (y * 0.12) + "px,0)";
    }, { passive: true });
  }

  document.querySelectorAll("[data-topic]").forEach(function (el) {
    el.addEventListener("click", function () {
      var topic = el.getAttribute("data-topic");
      if (topicSelect && topic) {
        var found = false;
        Array.prototype.forEach.call(topicSelect.options, function (opt) {
          if (opt.value === topic || opt.text === topic) {
            topicSelect.value = opt.value || opt.text;
            found = true;
          }
        });
        if (!found) {
          topicSelect.value = topic;
        }
      }
    });
  });

  function showToast(msg) {
    if (!toast) return;
    toast.hidden = false;
    toast.textContent = msg;
    toast.classList.add("is-on");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(function () {
      toast.classList.remove("is-on");
      window.setTimeout(function () { toast.hidden = true; }, 280);
    }, 3200);
  }

  function setInvalid(el, on) {
    if (!el) return;
    el.classList.toggle("is-invalid", !!on);
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name;
      var email = form.elements.email;
      var topic = form.elements.topic;
      var message = form.elements.message;
      var consent = form.elements.consent;
      var ok = true;

      setInvalid(name.closest(".field"), !name.value.trim());
      if (!name.value.trim()) ok = false;

      var emailOk = email.value.trim() && validEmail(email.value.trim());
      setInvalid(email.closest(".field"), !emailOk);
      if (!emailOk) ok = false;

      setInvalid(topic.closest(".field"), !topic.value);
      if (!topic.value) ok = false;

      setInvalid(message.closest(".field"), !message.value.trim());
      if (!message.value.trim()) ok = false;

      var consentLabel = consent.closest(".consent");
      setInvalid(consentLabel, !consent.checked);
      if (!consent.checked) ok = false;

      if (!ok) {
        showToast("Please complete the required fields.");
        var first = form.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea, .consent.is-invalid input");
        if (first) first.focus();
        return;
      }

      form.reset();
      form.querySelectorAll(".is-invalid").forEach(function (n) {
        n.classList.remove("is-invalid");
      });
      showToast("Thank you. Your enquiry is ready — this preview does not send data.");
    });

    form.addEventListener("input", function (e) {
      var t = e.target;
      if (!t) return;
      if (t.name === "consent") {
        setInvalid(t.closest(".consent"), false);
      } else if (t.closest(".field")) {
        setInvalid(t.closest(".field"), false);
      }
    });
  }
})();
