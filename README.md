# 모바일 청첩장

빌드 도구 없이 `public/` 안의 HTML·CSS·JS 세 파일로 만든 모바일 청첩장입니다. Cloudflare Pages에 정적 사이트로 배포합니다.

## 로컬에서 보기

```bash
python3 -m http.server -d public 8000   # http://localhost:8000
# 또는
npx wrangler@4 pages dev                # http://localhost:8788
```

`index.html`을 파일로 바로 열어도 대부분 보이지만, 복사 기능 등은 서버로 띄워야 제대로 동작합니다.

## 내용 수정하기

| 바꿀 것 | 위치 |
|---|---|
| 이름, 인사말, 혼주, 교통·주차 안내, 계좌번호 | `public/index.html` 본문 텍스트 |
| 계좌 복사 시 들어가는 값 | `public/index.html` 각 복사 버튼의 `data-copy="..."` |
| 예식 일시, 갤러리 장수, 장소명·주소·위도·경도, 카카오 JS 키, 공유 제목·설명 | `public/main.js` 맨 위 `CONFIG` |
| 페이지 제목, 미리보기(OG) 제목·설명 | `public/index.html` `<head>`의 `<title>`, `og:*` 메타 |
| 색상, 폰트 | `public/style.css` 맨 위 `:root` 변수 |

- 커버·캘린더·푸터의 날짜와 오시는 길의 장소명·주소는 `CONFIG`에서 자동으로 채워집니다.
- `CONFIG.date`는 `2027-05-15T12:30:00+09:00`처럼 `+09:00`을 붙인 형식을 유지하세요. 달력과 D-day는 접속한 기기의 시간대와 관계없이 한국 시간 기준으로 계산합니다.
- 위도·경도는 카카오맵이나 네이버지도에서 예식장을 찾아 확인합니다.

## 사진 넣기

아래 이름으로 파일을 넣기만 하면 코드 수정 없이 반영됩니다. 파일이 없는 동안에는 회색 박스로 보입니다.

| 용도 | 경로 (`public/` 기준) | 권장 규격 |
|---|---|---|
| 커버 메인 | `images/main.jpg` | 세로 1200×1600, 300KB 이하 |
| 갤러리 원본 | `images/gallery/01.jpg` … `NN.jpg` | 긴 변 1600px |
| 갤러리 썸네일 | `images/gallery/thumb/01.jpg` … | 긴 변 400px |
| 약도 | `images/map.jpg` | 가로 1200px |
| 공유 썸네일(OG) | `images/og.jpg` | 1200×630 |

- 갤러리 장수는 `CONFIG.galleryCount`(기본 12)로 정합니다. 번호는 두 자리(`01`, `02` …)로 맞추세요.
- 썸네일은 macOS에서 아래 한 줄로 만들 수 있습니다.

```bash
mkdir -p public/images/gallery/thumb
sips -Z 400 public/images/gallery/*.jpg --out public/images/gallery/thumb/
```

## 배포 (Cloudflare Pages)

```bash
npx wrangler@4 login
npx wrangler@4 pages project create k-wedding-card --production-branch main   # 처음 한 번만
npx wrangler@4 pages deploy
```

배포가 끝나면 `https://k-wedding-card.pages.dev` 같은 주소가 나옵니다. 프로젝트 이름이 이미 쓰이고 있으면 다른 이름으로 만들고 `wrangler.toml`의 `name`도 같이 바꾸세요.

### 배포 도메인 확정 후 index.html의 og:url / og:image 절대 URL 교체

카카오톡·문자 미리보기는 `public/index.html` `<head>`의 OG 태그를 읽습니다. 지금은 임시 주소 `https://k-wedding-card.pages.dev/`가 들어 있으니, 실제 배포 주소(또는 커스텀 도메인)로 바꾼 뒤 다시 배포하세요.

```html
<meta property="og:image" content="https://실제도메인/images/og.jpg">
<meta property="og:url" content="https://실제도메인/">
```

## 카카오톡 공유 설정

1. [Kakao Developers](https://developers.kakao.com)에서 애플리케이션을 만듭니다.
2. 앱 설정 → 플랫폼 → Web → 사이트 도메인에 배포 주소를 등록합니다. `https://k-wedding-card.pages.dev`와 커스텀 도메인을 쓴다면 그 주소도 함께 등록합니다. 로컬에서 시험하려면 `http://localhost:8000`도 추가합니다.
3. 앱 키 → JavaScript 키를 `public/main.js`의 `CONFIG.kakaoKey`에 넣습니다. 키가 비어 있으면 카카오톡 공유 버튼은 숨겨지고 링크 복사 버튼만 보입니다.
4. (권장) Kakao 공식 문서의 JavaScript SDK 2.7.4 `integrity` 값을 `main.js`의 SDK 로드 코드에 추가합니다 (`ponytail:` 주석 위치).

### 미리보기가 예전 이미지·문구로 나올 때

카카오톡은 링크 미리보기(OG)를 캐시합니다. `og.jpg`나 OG 문구를 바꾼 뒤에는 [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에 배포 URL을 넣고 **캐시 초기화**를 누르세요.
