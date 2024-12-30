import styles from './SignUpButton.module.css';
import Link from 'next/link';

export default function SignUpButton() {
  return (
    // <Link href="/login">
      <button className={styles.signUpButton}>회원가입</button>
    // </Link>
  );
}
