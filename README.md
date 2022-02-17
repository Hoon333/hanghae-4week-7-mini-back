# 응답하라MZ

'응답하라MZ'는 MZ세대의 추억을 공유하는 플랫폼입니다.<br>
공유하고 싶은 사진을 올려 친구들에게 이에 대해 아는 지 물어보세요!<br>
댓글로 서로의 생각을 나누며 공감하게 될 것입니다 ;)

<br><br>

## 🌏 Home Page

-   http://

<br><br>

## 📖 History

항해 99 5기 두 번째 미니프로젝트로써 시작하게 되었습니다.
2022.2.11 - 2022.2.17 총 7일간 제작의 결과물입니다.

<br><br>

## 🏢 Back Office git

-   https://github.com/rednada1708/hanghae-4week-7-mini-back

<br><br>

## 📚 Back-End 기술스택

|  이름   |        설명        |
| :-----: | :----------------: |
| AWS EC2 |       Server       |
| Node.js | Javascript Runtime |
| Express |   Web Framework    |
| MongoDB |      Database      |

<br><br>

## 📒 라이브러리

|     name     |         Appliance          | version  |
| :----------: | :------------------------: | :------: |
|   aws-sdk    |          S3 접근           | 2.1073.0 |
|    bcrypt    |      패스워드 암호화       |  5.0.1   |
|     cors     |   Request resource 제한    |  2.8.5   |
|    dotenv    |       환경변수 설정        |  16.0.0  |
| jsonwebtoken |        로그인 인증         |  8.5.1   |
|   mongoose   | 변동성 많은 DB. NoSQL 적용 |  6.2.1   |
|    multer    |     이미지 데이터 처리     |  1.4.4   |
|  multer-S3   |      사진 파일 업로드      |  2.10.0  |
|   prettier   |        코드 포맷팅         |  9.2.0   |
|    moment    |  스키마 내 날짜 자동 출력  |  2.29.1  |

<br><br>

## 💻 핵심 기능

-   로그인
    <br>
    : 사용자로 부터 아이디와 비밀번호를 받아서 mongoDB에 있는 유저정보와 비교한다
    <br>
    : 사용자로 부터 받은 정보와 DB에 있는 정보가 일치하면 JWT 토큰을 클라이언트에게 전달함
    <br>
-   회원가입
    <br>
    : 회원 가입 시 ID 중복 확인
    <br>
    : 비밀번호는 bcrypt 로 암호화하여 DB에 저장
    <br>

-   게시글 (조회, 작성, 수정, 삭제)
    <br>
    : 게시글 조회는 로그인을 안해도 조회 가능
    <br>
    : jwt 토큰을 검증하여 로그인된 상태인지 아닌지 확인을 하고 로그인이 된 상태이면 게시글 작성기능 가능
    <br>
    : 로그인이 된 상태이고 게시글이 자기가 쓴 글이면 수정 및 삭제 가능
-   댓글 (조회, 작성, 삭제)
    <br>
    : 해당 게시글에 달린 댓글은 로그인을 안해도 조회 가능
    <br>
    : jwt 토큰을 검증하여 로그인된 상태인지 아닌지 확인을 하고 로그인이 된 상태이면 댓글 작성기능 가능
    <br>
    : 로그인이 된 상태이고 댓글 자기가 쓴 댯글이면 수정 및 삭제 가능

<br><br>

## 🙏 팀원소개

### Front-End

-   이규리 : https://github.com/degurrrrrr
-   최연서 : https://github.com/choi-sus

### Back-End

-   김지섭 : https://github.com/rednada1708
-   장창훈 : https://github.com/Hoon333
-   서동현 : https://github.com/donghyeon23
