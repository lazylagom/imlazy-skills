# Gemini Watermark Remover

Google Gemini AI로 생성된 이미지에서 SynthID 워터마크를 제거하는 도구입니다.

## 설치 방법

### 방법 1: add-skill을 통한 설치 (권장)

```bash
npx add-skill raiz/imlazy-skills --skill gemini-image-watermark-remove
```

### 방법 2: 직접 실행 (설치 없이)

```bash
npx gemini-image-watermark-remove image.png
```

### 방법 3: 로컬 개발/테스트

```bash
# 저장소 클론
git clone https://github.com/raiz/imlazy-skills.git
cd imlazy-skills/skills/gemini-image-watermark-remove

# 의존성 설치
pnpm install

# 실행
node scripts/remove-watermark.js image.png
```

## 사용 방법

### 기본 사용법

가장 간단한 사용법입니다. 출력 파일은 자동으로 `image_clean.png`로 생성됩니다.

```bash
npx gemini-image-watermark-remove image.png
```

### 출력 파일 경로 지정

```bash
# 특정 파일명으로 저장
npx gemini-image-watermark-remove image.png -o clean.png

# 다른 디렉토리에 저장
npx gemini-image-watermark-remove image.png -o ./output/result.png
```

### 마스크 모드 선택

이미지 크기에 따라 자동으로 마스크 크기가 선택되지만, 수동으로 지정할 수도 있습니다.

```bash
# 작은 마스크 강제 사용 (≤1024px 이미지용)
npx gemini-image-watermark-remove image.png -m small

# 큰 마스크 강제 사용 (>1024px 이미지용)
npx gemini-image-watermark-remove image.png -m large

# 자동 감지 (기본값)
npx gemini-image-watermark-remove image.png -m auto
```

### 알파 게인 조정

워터마크가 잘 제거되지 않을 경우 게인 값을 높여보세요.

```bash
# 기본 제거 강도
npx gemini-image-watermark-remove image.png -g 1.0

# 더 강한 제거 (워터마크가 진하게 보일 때)
npx gemini-image-watermark-remove image.png -g 1.5

# 최대 강도 (주의: 이미지 품질이 저하될 수 있음)
npx gemini-image-watermark-remove image.png -g 2.5
```

### 여러 옵션 조합

```bash
npx gemini-image-watermark-remove input.png -o output.png -m large -g 1.5
```

### 배치 처리 (여러 이미지 한 번에 처리)

**Linux/Mac:**
```bash
for file in *.png; do
  npx gemini-image-watermark-remove "$file"
done
```

**Windows (PowerShell):**
```powershell
Get-ChildItem *.png | ForEach-Object {
  npx gemini-image-watermark-remove $_.Name
}
```

## 옵션 상세 설명

| 옵션 | 설명 | 기본값 | 예시 |
|------|------|--------|------|
| `-o, --output` | 출력 파일 경로 지정 | `<파일명>_clean.<확장자>` | `-o result.png` |
| `-m, --mode` | 마스크 모드: `auto`, `small`, `large` | `auto` | `-m large` |
| `-g, --gain` | 알파 게인 값 (1.0-3.0) | `1.0` | `-g 1.5` |
| `-h, --help` | 도움말 출력 | - | `-h` |

### 옵션별 사용 가이드

#### `-o, --output` (출력 파일)
- 지정하지 않으면 원본 파일명에 `_clean`이 추가됩니다
- 디렉토리 경로를 포함할 수 있습니다 (디렉토리는 미리 생성되어 있어야 함)
- 원본과 다른 포맷으로 저장 가능 (예: PNG → JPG)

#### `-m, --mode` (마스크 모드)
- **auto**: 이미지 크기에 따라 자동 선택 (권장)
  - ≤1024px: small 마스크 사용
  - >1024px: large 마스크 사용
- **small**: 48×48 마스크, 32px 여백 (작은 이미지용)
- **large**: 96×96 마스크, 64px 여백 (큰 이미지용)

#### `-g, --gain` (알파 게인)
- 워터마크 제거 강도를 조절합니다
- **1.0**: 표준 제거 (대부분의 경우 충분)
- **1.5-2.0**: 진한 워터마크용
- **2.0-3.0**: 매우 진한 워터마크용 (이미지 품질 저하 가능)

## 동작 원리

이 도구는 역알파 블렌딩(Reverse Alpha Blending) 알고리즘을 사용하여 워터마크를 제거합니다.

### 알고리즘

```
원본_픽셀 = (현재_픽셀 - α × 워터마크_색상) / (1 - α)
```

### 처리 과정

1. **이미지 로드**: Sharp 라이브러리를 사용하여 이미지를 RAW 데이터로 로드
2. **마스크 선택**: 이미지 크기에 따라 적절한 마스크 선택
3. **워터마크 위치 계산**: 이미지 우측 하단에서 마진을 고려하여 위치 결정
4. **픽셀별 처리**: 마스크의 알파 값을 사용하여 각 픽셀에서 워터마크 제거
5. **결과 저장**: 처리된 이미지를 지정된 경로에 저장

### 마스크 크기 자동 감지

| 이미지 크기 | 마스크 크기 | 여백 | 사용 시나리오 |
|------------|------------|------|--------------|
| ≤1024px | 48×48px | 32px | 일반 해상도, 웹용 이미지 |
| >1024px | 96×96px | 64px | 고해상도, 인쇄용 이미지 |

## 지원 포맷

입력 및 출력 모두 다음 포맷을 지원합니다:
- **PNG** (권장: 무손실 압축)
- **JPG/JPEG**
- **WebP**
- **TIFF**
- **GIF**

## 문제 해결

### 워터마크가 완전히 제거되지 않을 때

1. 알파 게인 값을 높여보세요:
   ```bash
   npx gemini-image-watermark-remove image.png -g 1.5
   ```

2. 마스크 모드를 수동으로 변경해보세요:
   ```bash
   npx gemini-image-watermark-remove image.png -m large
   ```

### 이미지 품질이 저하될 때

- 알파 게인 값을 낮추세요 (기본값 1.0 사용)
- PNG 포맷으로 출력하여 무손실 압축 사용

### "Image dimensions too small" 오류

- 이미지가 너무 작아 워터마크 영역을 처리할 수 없습니다
- 최소 권장 크기: 128×128px 이상

### 파일을 찾을 수 없다는 오류

- 파일 경로가 올바른지 확인하세요
- 상대 경로 대신 절대 경로를 사용해보세요
- 파일명에 공백이 있다면 따옴표로 감싸세요:
  ```bash
  npx gemini-image-watermark-remove "my image.png"
  ```

## 제한 사항

- SynthID 워터마크는 이미지 우측 하단에 위치한다고 가정합니다
- 워터마크가 다른 위치에 있거나 여러 개인 경우 작동하지 않습니다
- 매우 복잡한 배경 위의 워터마크는 완벽하게 제거되지 않을 수 있습니다

## 기여하기

버그 리포트나 기능 제안은 [GitHub Issues](https://github.com/raiz/imlazy-skills/issues)에 등록해주세요.

## 라이선스

MIT
