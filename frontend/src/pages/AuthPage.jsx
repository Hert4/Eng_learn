import LoginComp from "../components/LoginComp"
import { useRecoilValue } from 'recoil'
import authScreenAtom from '../atom/authAtom'
import SignupComp from "../components/SignupComp"
const AuthPage = () => {
    const authScreenState = useRecoilValue(authScreenAtom)
    console.log(authScreenState)
    // [value , setValue] = useState('login')
    return (
        <>
            {authScreenState === 'login' ? <LoginComp /> : <SignupComp />}
        </>
    )
}

export default AuthPage

