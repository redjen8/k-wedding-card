// 청첩장 설정. JS가 그리는 값(날짜·갤러리 장수·장소·카카오 공유)은 모두 여기서 바꿉니다.
const CONFIG = {
  date: '2027-05-15T12:30:00+09:00', // 예식 일시. +09:00(KST)은 그대로 두세요.
  galleryCount: 12, // images/gallery/01.jpg ~ NN.jpg 장수
  kakaoKey: '', // Kakao Developers JavaScript 키. 비워 두면 카카오톡 공유 버튼이 숨겨집니다.
  venue: {
    name: '예식장명',
    address: '서울특별시 ○○구 ○○로 00',
    lat: 37.5665,
    lng: 126.978,
  },
  share: {
    title: '신랑이름 · 신부이름 결혼합니다',
    description: '2027년 5월 15일 토요일 오후 12시 30분, 예식장명',
  },
};

const $ = (s) => document.querySelector(s);
const pad = (n) => String(n).padStart(2, '0');
const KST = 9 * 3600e3;
const DAY = 86400e3;

// 예식 일시를 KST 기준으로 분해 (UTC getter + 9시간 → 기기 시간대와 무관)
const wedding = new Date(CONFIG.date).getTime();
const k = new Date(wedding + KST);
const Y = k.getUTCFullYear(), M = k.getUTCMonth(), D = k.getUTCDate();
const W = k.getUTCDay(), h = k.getUTCHours(), mi = k.getUTCMinutes();
const h12 = h % 12 || 12;

const dateText = {
  dot: `${Y}.${pad(M + 1)}.${pad(D)}`,
  en: `${['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][W]} ${h12}:${pad(mi)} ${h < 12 ? 'AM' : 'PM'}`,
  ko: `${Y}년 ${M + 1}월 ${D}일 ${'일월화수목금토'[W]}요일 ${h < 12 ? '오전' : '오후'} ${h12}시${mi ? ` ${mi}분` : ''}`,
  month: `${Y}.${pad(M + 1)}`,
  monthName: new Date(Date.UTC(Y, M, 1)).toLocaleString('en', { month: 'long', timeZone: 'UTC' }).toUpperCase(),
};
document.querySelectorAll('[data-date]').forEach((el) => (el.textContent = dateText[el.dataset.date]));
document.querySelectorAll('[data-venue]').forEach((el) => (el.textContent = CONFIG.venue[el.dataset.venue]));

// 캘린더: 예식 월을 요일에 맞춰 배치
const calDays = $('#cal-days');
const firstWeekday = new Date(Date.UTC(Y, M, 1)).getUTCDay();
const lastDate = new Date(Date.UTC(Y, M + 1, 0)).getUTCDate();
for (let i = 0; i < firstWeekday; i++) calDays.append(document.createElement('li'));
for (let d = 1; d <= lastDate; d++) {
  const li = document.createElement('li');
  li.textContent = d;
  if (d === D) {
    li.className = 'is-day';
    li.setAttribute('aria-current', 'date');
  }
  calDays.append(li);
}

// 카운트다운 + D-day (날짜 차이는 KST 자정 기준)
const kstDay = (t) => Math.floor((t + KST) / DAY);
const [cdD, cdH, cdM, cdS, dday] = ['#cd-d', '#cd-h', '#cd-m', '#cd-s', '#dday'].map($);
function tick() {
  const now = Date.now();
  const left = Math.max(0, wedding - now);
  cdD.textContent = Math.floor(left / DAY);
  cdH.textContent = pad(Math.floor(left / 3600e3) % 24);
  cdM.textContent = pad(Math.floor(left / 60e3) % 60);
  cdS.textContent = pad(Math.floor(left / 1e3) % 60);
  const diff = kstDay(wedding) - kstDay(now);
  dday.textContent = diff > 0 ? `D-${diff}` : diff === 0 ? 'D-DAY' : `D+${-diff}`;
}
tick();
setInterval(tick, 1000);

// 갤러리 + 라이트박스
function photo(src, label, alt) {
  const box = document.createElement('div');
  box.className = 'ph';
  box.dataset.label = label;
  const img = document.createElement('img');
  img.onerror = () => (img.hidden = true); // 파일이 없으면 회색 박스만 보이게
  img.loading = 'lazy';
  img.alt = alt;
  img.src = src;
  box.append(img);
  return box;
}

const N = CONFIG.galleryCount;
const grid = $('#gallery-grid');
const lb = $('#lightbox');
const track = $('#lb-track');
const prevBtn = $('#lb-prev');
const nextBtn = $('#lb-next');

for (let i = 0; i < N; i++) {
  const nn = pad(i + 1);
  const thumb = document.createElement('button');
  thumb.type = 'button';
  thumb.className = 'thumb';
  thumb.setAttribute('aria-label', `사진 ${i + 1} 크게 보기`);
  thumb.append(photo(`images/gallery/thumb/${nn}.jpg`, `PHOTO ${nn}`, ''));
  thumb.addEventListener('click', () => openLightbox(i));
  grid.append(thumb);

  const slide = document.createElement('div');
  slide.className = 'lb-slide';
  slide.append(photo(`images/gallery/${nn}.jpg`, `PHOTO ${nn}`, `갤러리 사진 ${i + 1}`));
  track.append(slide);
}
$('#lb-total').textContent = N;

const current = () => Math.round(track.scrollLeft / track.clientWidth);
function syncIndex() {
  const i = current();
  $('#lb-index').textContent = i + 1;
  prevBtn.disabled = i === 0;
  nextBtn.disabled = i === N - 1;
}
function go(step) {
  track.scrollBy({ left: step * track.clientWidth, behavior: 'smooth' });
}
function openLightbox(i) {
  lb.showModal();
  document.documentElement.classList.add('locked');
  track.scrollLeft = i * track.clientWidth;
  syncIndex();
}
lb.addEventListener('close', () => document.documentElement.classList.remove('locked')); // Esc 포함
track.addEventListener('scroll', syncIndex, { passive: true });
prevBtn.addEventListener('click', () => go(-1));
nextBtn.addEventListener('click', () => go(1));
$('#lb-close').addEventListener('click', () => lb.close());
lb.addEventListener('click', (e) => {
  if (e.target === lb || e.target.classList.contains('lb-slide')) lb.close(); // 사진 바깥 탭
});
lb.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') go(-1);
  if (e.key === 'ArrowRight') go(1);
});

// 오시는 길: 길찾기 링크
const { name, address, lat, lng } = CONFIG.venue;
const enc = encodeURIComponent;
$('#nav-kakao').href = `https://map.kakao.com/link/to/${enc(name)},${lat},${lng}`;
$('#nav-naver').href = `https://map.naver.com/p/search/${enc(address)}`;
$('#nav-tmap').href = `tmap://route?goalname=${enc(name)}&goalx=${lng}&goaly=${lat}`; // 앱 설치 시에만 동작
$('#copy-address').dataset.copy = address;

// 복사 (계좌·주소·링크 공용) + 토스트
const toastEl = $('#toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // HTTP 접속이나 구형 인앱 브라우저용 대체 경로
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if (!ok) return toast('복사에 실패했습니다');
  }
  toast('복사되었습니다');
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-copy]');
  if (btn) copy(btn.dataset.copy);
});

// 공유
const pageUrl = location.origin + location.pathname;
$('#copy-link').dataset.copy = pageUrl;

if (CONFIG.kakaoKey) {
  const kakaoBtn = $('#share-kakao');
  const s = document.createElement('script');
  s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
  s.crossOrigin = 'anonymous';
  // ponytail: integrity 미지정. Kakao 공식 문서(JavaScript SDK 다운로드 페이지)의 2.7.4 integrity 값을 s.integrity 에 넣으세요.
  s.onload = () => {
    Kakao.init(CONFIG.kakaoKey);
    kakaoBtn.hidden = false;
  };
  document.head.append(s);
  kakaoBtn.addEventListener('click', () => {
    const link = { mobileWebUrl: pageUrl, webUrl: pageUrl };
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: CONFIG.share.title,
        description: CONFIG.share.description,
        imageUrl: `${location.origin}/images/og.jpg`,
        link,
      },
      buttons: [{ title: '청첩장 보기', link }],
    });
  });
}

// 섹션 페이드인 (html.js 는 index.html <head>에서 붙임. prefers-reduced-motion 이면 CSS 쪽에서 꺼짐)
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }),
  { rootMargin: '0px 0px -10% 0px' },
);
document.querySelectorAll('main > section').forEach((s) => io.observe(s));
