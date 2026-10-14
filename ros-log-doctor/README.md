# ROS Log Doctor 사용 방법

## 기본 진단

dist/index.html을 더블클릭하세요. 로그 파일 업로드, 붙여넣기, 예제 로그, 패턴 진단, 검색·필터, 보고서 저장을 사용할 수 있습니다. 기본 진단은 브라우저에서 처리하며 API 비용이 없습니다.

## 선택 기능: API 심층 분석

Node.js 20 이상이 필요합니다. 이 폴더에서 node server.mjs 또는 npm start를 실행한 뒤 http://127.0.0.1:8787 을 여세요.

서버 실행 전에 OPENAI_API_KEY와 OPENAI_MODEL 환경 변수를 설정하면 API 심층 분석을 사용할 수 있습니다. OpenAI API 사용량은 별도로 과금될 수 있습니다. API 키는 코드나 브라우저에 저장하지 마세요. 파일 직접 열기에서는 API 심층 분석이 비활성화됩니다.

## 남겨둔 파일

dist: 실행 화면, 진단 스크립트, 스타일과 글꼴. analyzer.js는 API 서버에서도 사용하므로 필요합니다.
server.mjs와 package.json: 로컬 API 서버 실행용.
FONTS.md와 dist/fonts/Pretendard-OFL.txt: 글꼴 정보와 라이선스.
README.md: 이 사용 안내.

## 유지보수와 회귀 검사

이번 오류 수정 이후 src/app.js, src/view-model.js, dist/analyzer.js를 원본으로 유지합니다. npm run build로 브라우저용 dist/app.js를 생성하고, npm run check:build로 원본과 일치하는지 확인하세요. npm test는 회귀 테스트이며 실제 유료 API를 호출하지 않습니다. build-browser.mjs, src, test는 오류 재발 방지를 위한 필수 개발 파일입니다.

원본 파일 위치는 파일명:줄 번호로 표시합니다. 500개 항목씩 페이지를 넘길 수 있고 근거 클릭 시 해당 페이지로 이동합니다. 치명적 오류를 먼저, 나머지는 선행 패턴과 후속 증상으로 구분해 심각도와 입력 순서로 표시합니다. 시간·파일·로거가 비교 가능한 경우에만 앞서 관찰된 패턴을 연결하며 인과관계를 확정하지 않습니다. 여러 파일 간 시계 동기화는 하지 않습니다.

IPv6 주소, MAC 주소, /root 사용자 경로, 라벨이 있는 hostname/host 및 ROS_DOMAIN_ID를 마스킹합니다. 라벨 없는 호스트명은 자동 구분할 수 없습니다. 버전으로 명시된 IPv4 모양의 값은 보존하지만, 맥락 없는 값은 IP로 보수적으로 마스킹합니다. 완전한 익명화는 보장하지 않습니다.
