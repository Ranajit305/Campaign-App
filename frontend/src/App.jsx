import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import useCompanyStore from './stores/useCompanyStore'
import Sidebar from './components/Sidebar'
import Campaigns from './pages/Campaigns'
import Customers from './pages/Customers'
import Referrals from './pages/Referrals'
import ReferralPage from './pages/ReferralPage'
import ReferredPage from './pages/ReferredPage'
import AgentAI from './components/AgentAI'
import CreateCampaign from './components/CreateCampaign'
import useCampaignStore from './stores/useCampaignStore'
import useCustomerStore from './stores/useCustomerStore'
import Email from './components/Email'

const App = () => {

  const { company, checkCompany } = useCompanyStore();
  const { newCampaign } = useCampaignStore();
  const { mail } = useCustomerStore();

  useEffect(() => {
    checkCompany();
  }, [])

  return (
    <div className={`${company && 'md:flex'} `}>
      
      <Routes>
        <Route path='/' element={!company ? <Login /> : <Navigate to='/dashboard'/>} />
        <Route path='/dashboard' element={company ? <Dashboard /> : <Navigate to='/'/>} />
        <Route path='/campaigns' element={company ? <Campaigns /> : <Navigate to='/'/>} />
        <Route path='/customers' element={company ? <Customers /> : <Navigate to='/'/>} />
        <Route path='/referrals' element={company ? <Referrals /> : <Navigate to='/' />} />
        <Route path="/referral" element={!company ? <ReferralPage /> : <Navigate to='/'/>} />
        <Route path='/referred' element={!company ? <ReferredPage /> : <Navigate to='/' />} />
      </Routes>
    </div>
  )
}

export default App