(function () {
  "use strict";

  /*1. MOBILE MENU TOGGLE*/
  function initMobileMenu() {
    var toggleBtn = document.querySelector(".navbar__toggle");
    var menu = document.querySelector(".navbar__menu");

    if (!toggleBtn || !menu) {
      return; // Trang không có navbar (phòng trường hợp tái sử dụng file)
    }

    toggleBtn.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      toggleBtn.classList.toggle("is-active", isOpen);
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Tự đóng menu khi người dùng chọn 1 mục (trải nghiệm tốt hơn trên mobile)
    var menuLinks = menu.querySelectorAll("a");
    menuLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggleBtn.classList.remove("is-active");
        toggleBtn.setAttribute("aria-expanded", "false");
      });
    });

    // Đóng menu nếu người dùng resize sang màn hình desktop trong lúc menu mở
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 768) {
        menu.classList.remove("is-open");
        toggleBtn.classList.remove("is-active");
      }
    });
  }

  /*2. ĐÈN KÉO QUÂN 3D — XOAY LIÊN TỤC + PAUSE/RESUME KHI HOVER*/
  function initLantern() {
    var lantern = document.querySelector(".lantern");
    if (!lantern) {
      return; // Không phải trang đèn kéo quân -> bỏ qua
    }

    var statusBadge = document.querySelector(".lantern-status");
    var statusText = document.querySelector(".lantern-status__text");

    var currentAngle = 0;         // Góc xoay hiện tại (độ)
    var rotationSpeed = 0.18;     // Tốc độ xoay (độ / mỗi frame) — chỉnh tại đây để nhanh/chậm
    var isPaused = false;         // Trạng thái dừng khi hover
    var rafId = null;

    // Tôn trọng người dùng yêu cầu giảm hiệu ứng chuyển động (a11y)
    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function updateStatusUI(paused) {
      if (!statusBadge || !statusText) return;
      statusBadge.classList.toggle("is-paused", paused);
      statusText.textContent = paused
        ? "Đã tạm dừng (đang rê chuột)"
        : "Đang xoay tự động";
    }

    // Vòng lặp animation chính — dùng requestAnimationFrame để xoay mượt mà,
    // đồng bộ với khung hình của trình duyệt (mượt hơn setInterval nhiều).
    function rotateLoop() {
      if (!isPaused) {
        currentAngle += rotationSpeed;
        if (currentAngle >= 360) {
          currentAngle -= 360; // Giữ giá trị nhỏ, tránh số tăng vô hạn
        }
        lantern.style.transform = "rotateY(" + currentAngle + "deg)";
      }
      rafId = requestAnimationFrame(rotateLoop);
    }

    function pauseLantern() {
      isPaused = true;
      updateStatusUI(true);
    }

    function resumeLantern() {
      isPaused = false;
      updateStatusUI(false);
    }

    // Gắn sự kiện mouseenter/mouseleave lên TỪNG mặt ảnh của lồng đèn
    // (đúng yêu cầu đề bài: "hover vào BẤT KỲ ảnH nào thì dừng").
    var faces = lantern.querySelectorAll(".lantern__face");
    faces.forEach(function (face) {
      face.addEventListener("mouseenter", pauseLantern);
      face.addEventListener("mouseleave", resumeLantern);

      // Hỗ trợ thêm cho thiết bị cảm ứng: chạm vào ảnh cũng tạm dừng,
      // chạm ra ngoài lồng đèn thì xoay tiếp.
      face.addEventListener("touchstart", pauseLantern, { passive: true });
    });

    lantern.addEventListener("touchend", resumeLantern);

    // Nếu người dùng cấu hình giảm hiệu ứng động trên hệ điều hành/trình
    // duyệt, hiển thị tĩnh ở góc nghiêng nhẹ thay vì xoay liên tục.
    if (prefersReducedMotion) {
      lantern.style.transform = "rotateY(15deg)";
      updateStatusUI(true);
      if (statusText) {
        statusText.textContent = "Đã tắt xoay tự động (Reduced Motion)";
      }
      return;
    }

    updateStatusUI(false);
    rafId = requestAnimationFrame(rotateLoop);

    // Dừng vòng lặp khi rời khỏi trang để tránh tốn tài nguyên không cần thiết
    window.addEventListener("beforeunload", function () {
      if (rafId) cancelAnimationFrame(rafId);
    });
  }

  /*3. KHỞI CHẠY KHI DOM ĐÃ SẴN SÀNG*/
  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initLantern();
  });
})();