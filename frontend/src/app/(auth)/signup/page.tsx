// component
import InputBox from './components/InputBox/InputBox'
import SignUpButton from './components/SignUpButton/SignUpButton'
import ProfileImage from './components/ProfileImage/ProfileImage'
// type
import { InputBoxProps } from '@/app/types/InputBoxProps'
// style
import styles from './SignUp.module.css'
import Link from 'next/link'



export default function SignUpPage() {
  return(
    <div className={styles.signUpBox}>
      <h1 className={styles.signUpTitle}>회원정보 입력</h1>
      <form>

        <ProfileImage 
          id=''
          accept=''/>
        
        <InputBox
          label='이름'
          type='text'
          id='name'
          name='userName'
          required
          />
        <InputBox
          label='생년월일'
          type='date'
          id='date'
          name='userDate'
          required
          />
        <InputBox
          label='닉네임'
          type='text'
          id='nickname'
          name='userNickname'
          required
          />
        <InputBox
          label='이메일(아이디)'
          type='email'
          id='email'
          name='userEmail'
          required
          />
        <InputBox
          label='비밀번호'
          type='password'
          id='password'
          name='userPassword'
          required
          />
        <InputBox
          label='비밀번호 확인'
          type='password'
          id='passwordCheck'
          name='userPasswordCheck'
          required
          />
      </form>
      
      <div>
        <SignUpButton />
      </div>
      
      <p className={styles.sign}>
        이미 계정이 있으신가요?
        <Link 
          className={styles.signUpLoginLink}
          href="/login">로그인</Link>
      </p>
    </div>
  )
}
