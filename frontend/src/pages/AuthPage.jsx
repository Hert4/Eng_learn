import { useRecoilValue } from 'recoil'
import authScreenAtom from '../atom/authAtom'
import LoginComp from '../components/LoginComp'
import SignupComp from '../components/SignupComp'

const AuthPage = () => {
    const authScreenState = useRecoilValue(authScreenAtom)
    console.log(authScreenState)
    return (
        <>
            {
                authScreenState === "login" ? <LoginComp /> : <SignupComp />
            }
        </>
    )
}

export default AuthPage