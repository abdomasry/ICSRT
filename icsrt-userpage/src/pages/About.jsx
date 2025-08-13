import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import FloatingContactButton from "../components/FloatingContactButton";
import { api } from "../lib/api";

const About = () => {
  const { t, isRTL } = useLanguage();
  const [aboutData, setAboutData] = useState({});
  const [missionData, setMissionData] = useState({});
  const [visionData, setVisionData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch about, mission, and vision data from backend
    const fetchData = async () => {
      try {
        const [about, mission, vision] = await Promise.all([
          api.get(`/api/about`),
          api.get(`/api/mission`),
          api.get(`/api/vision`)
        ]);

        // Handle API response structure {data: [...], pagination: {...}}
  const aboutArray = about?.data || about;
  const missionArray = mission?.data || mission;
  const visionArray = vision?.data || vision;

        setAboutData(Array.isArray(aboutArray) ? aboutArray[0] || {} : {});
        setMissionData(Array.isArray(missionArray) ? missionArray[0] || {} : {});
        setVisionData(Array.isArray(visionArray) ? visionArray[0] || {} : {});
        setLoading(false);
      } catch (err) {
        console.error("Error fetching about data:", err);
        setLoading(false);
        // Set fallback data
        setAboutData({
          title: "About ICSRT",
          content: "International Center for Scientific Research and Translation - Your trusted partner in academic excellence",
          bio: "We are dedicated to providing comprehensive academic services including research assistance, translation, and educational support to students and researchers worldwide."
        });
        setMissionData({
          title: "Our Mission",
          description: "To provide exceptional academic services and support to students, researchers, and institutions worldwide."
        });
        setVisionData({
          title: "Our Vision", 
          description: "To become the leading international platform for scientific research and translation services."
        });
      }
    };

    fetchData();
  }, []);
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Navigation */}

      {/* Header */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-blue-800 dark:text-blue-400 mb-6">
            {isRTL ? aboutData.titleAr || aboutData.title || t('about.title') : aboutData.title || t('about.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {isRTL ? aboutData.contentAr || aboutData.content || t('about.description') : aboutData.content || t('about.description')}
          </p>
        </div>
      </section>

      {/* Bio Section */}
      {(aboutData.bio || aboutData.bioAr) && (
        <section className="py-16 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto">
            <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
              <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-400 mb-8 text-center">
                {t('about.bio.title')}
              </h2>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {isRTL ? aboutData.bioAr || aboutData.bio : aboutData.bio || aboutData.bioAr}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('msg.loading')}</p>
        </div>
      )}

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-400 mb-6">
                {isRTL ? missionData.titleAr || missionData.title || t('about.mission.title') : missionData.title || t('about.mission.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {isRTL ? missionData.descriptionAr || missionData.description || t('about.mission.description') : missionData.description || t('about.mission.description')}
              </p>
            </div>
            
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-400 mb-6">
                {isRTL ? visionData.titleAr || visionData.title || t('about.vision.title') : visionData.title || t('about.vision.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {isRTL ? visionData.descriptionAr || visionData.description || t('about.vision.description') : visionData.description || t('about.vision.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-blue-800 dark:text-blue-400 mb-12">{t('about.approach.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('about.excellence.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('about.excellence.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('about.collaboration.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('about.collaboration.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('about.innovation.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('about.innovation.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-blue-600 dark:bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">{t('about.impact.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">12,425</div>
              <div className="text-xl">{t('about.stats.clients')}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">34</div>
              <div className="text-xl">{t('about.stats.countries')}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">5,000+</div>
              <div className="text-xl">{t('about.stats.projects')}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-xl">{t('about.stats.success')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-blue-800 dark:text-blue-400 mb-6">{t('about.cta.title')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {t('about.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/services" 
              className="bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-700 dark:to-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-blue-500 dark:hover:from-blue-600 dark:hover:to-blue-400 transition"
            >
              {t('about.cta.services')}
            </Link>
            <Link 
              to="/dashboard" 
              className="bg-gradient-to-r from-green-600 to-green-400 dark:from-green-700 dark:to-green-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:from-green-700 hover:to-green-500 dark:hover:from-green-600 dark:hover:to-green-400 transition"
            >
              {t('about.cta.portal')}
            </Link>
          </div>
        </div>
      </section>
      
      {/* Floating Contact Button */}
      <FloatingContactButton />
    </div>
  );
};

export default About;
