import { Route, Routes, useLocation } from 'react-router-dom';

import AssignmentSubmit from './pages/AssignmentSubmit';
import AvailableClasses from './pages/AvailableClasses';
import ClassResourcesPage from './pages/ClassResources';
import CustomNavbar from './componts/Navbar/Navbar';
import { Elements } from '@stripe/react-stripe-js';
import Footer from './componts/Footer/Footer';
import Footprints from './componts/Footprints/Footprints';
import GradePredictor from './pages/GradePredictor';
import Header from './componts/Header/Header';
import MyCalendar from './pages/MyCalendar';
import MyClasses from './pages/MyClasses';
import Payment from './pages/Payment';
import ProfilePage from './pages/ProfilePage';
import QuestionViewer from './pages/QuestionViewer';
import QuizAttempt from './pages/QuizAttempt';
import React from 'react';
import ShopItems from './componts/ShopItems/ShopItems';
import Sidebar from './componts/Sidebar/Sidebar';
import Testimonial from './componts/Testimonial/Testimonial';
import { assest } from './assest/assest';
import { loadStripe } from '@stripe/stripe-js';

const App = () => {
  const stripePromise = loadStripe('your_publishable_key');
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isProfilePage = location.pathname === '/profile';
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div
      className="App"
      style={{
        backgroundImage: `url(${assest.H5})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Navbar and Footer for Home and Profile pages only */}
      {(isHomePage || isProfilePage) && <CustomNavbar isHomePage={isHomePage} />}

      {isHomePage && (
        <>
          <Header />
          <ShopItems />
          <Footprints />
          <Testimonial />
        </>
      )}

      {/* Sidebar for Dashboard routes */}
      {isDashboardRoute && <Sidebar />}

      {/* Main Content Area */}
      <div style={{ marginLeft: isDashboardRoute ? '240px' : '0', padding: '20px' }}>
        <Routes>
          <Route path="/" element={<CustomNavbar isHomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<Sidebar />} />
          <Route path="/all-class" element={<AvailableClasses/>} />
          
          <Route path="/dashboard/marks-predictor" element={<GradePredictor />} />
          <Route path="/quizzes/:quizId/attempt" element={<QuizAttempt />} />
           <Route path="/assignments/:assignmentId/submit" element={<AssignmentSubmit />} />
        
 
          <Route path="/questions/:questionId/view" element={<QuestionViewer />} />
          
          {/* Payment Route */}
          <Route
  path="/payment/:enrollmentId"
  element={
    <Elements stripe={stripePromise}>
      <Payment />
    </Elements>
  }
/>
           <Route path="/dashboard/calender" element={<MyCalendar/>} />
          <Route path="/dashboard/my-classes" element={<MyClasses />} />
          <Route path="/classes/:class_id/resources" element={<ClassResourcesPage />} />
        </Routes>
      </div>

      {/* Footer only on Home and Profile pages */}
      {(isHomePage || isProfilePage) && <Footer />}
    </div>
  );
};

export default App;
