import { Link } from 'react-router-dom'

const Footer = () => {
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Departments', path: '/departments' },
    { name: 'News', path: '/news' },
  ]

  const services = [
    { name: 'Regulatory Impact Assessment', path: '/services#ria' },
    { name: 'Regulatory Services Centres', path: '/services#rsc' },
    { name: 'e-Services', path: '/services#eservices' },
    { name: 'e-Registry Portal', path: '/e-registry' },
  ]

  const partners = [
    { name: 'ZTA', fullName: 'Zambia Tourism Agency' },
    { name: 'ZMA', fullName: 'Zambia Medicines Authority' },
    { name: 'ZBS', fullName: 'Zambia Bureau of Standards' },
    { name: 'NAPSA', fullName: 'National Pension Scheme Authority' },
    { name: 'ZPPA', fullName: 'Zambia Public Procurement Authority' },
    { name: 'MCTI', fullName: 'Ministry of Commerce, Trade and Industry' },
    { name: 'CEEC', fullName: 'Citizens Economic Empowerment Commission' },
    { name: 'PACRA', fullName: 'Patents and Companies Registration Agency' },
  ]

  return (
    <footer className="bg-emerald-600 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About BRRA */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">BRRA</h3>
                <p className="text-emerald-100 text-xs">Business Regulatory Review Agency</p>
              </div>
            </div>
            <p className="text-emerald-100 text-sm leading-relaxed">
              The Business Regulatory Review Agency is a statutory body established under the 
              Business Regulatory Act No. 3 of 2014, promoting a conducive business regulatory 
              environment in Zambia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-emerald-100 hover:text-white text-sm transition-colors flex items-center"
                  >
                    <i className="ri-arrow-right-s-line mr-1"></i>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Our Services</h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.path}>
                  <Link 
                    to={service.path}
                    className="text-emerald-100 hover:text-white text-sm transition-colors flex items-center"
                  >
                    <i className="ri-arrow-right-s-line mr-1"></i>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="ri-map-pin-line mt-1 mr-3 text-emerald-200"></i>
                <span className="text-emerald-100 text-sm">
                  Plot No. 2251, Fairley Road,<br />
                  Ridgeway, LUSAKA, ZAMBIA
                </span>
              </li>
              <li className="flex items-center">
                <i className="ri-phone-line mr-3 text-emerald-200"></i>
                <a href="tel:+260211259165" className="text-emerald-100 hover:text-white text-sm transition-colors">
                  +260 211 259165
                </a>
              </li>
              <li className="flex items-center">
                <i className="ri-mail-line mr-3 text-emerald-200"></i>
                <a href="mailto:info@brra.org.zm" className="text-emerald-100 hover:text-white text-sm transition-colors">
                  info@brra.org.zm
                </a>
              </li>
              <li className="flex items-center">
                <i className="ri-time-line mr-3 text-emerald-200"></i>
                <span className="text-emerald-100 text-sm">
                  Mon - Fri: 8:00AM - 5:00PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Partners Section */}
        <div className="mt-12 pt-8 border-t border-emerald-500">
          <h4 className="font-semibold text-lg mb-4 text-center">Our Partners</h4>
          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((partner) => (
              <div 
                key={partner.name}
                className="bg-white/10 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors cursor-default"
                title={partner.fullName}
              >
                {partner.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-emerald-100 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Business Regulatory Review Agency. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <i className="ri-facebook-fill text-sm"></i>
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <i className="ri-twitter-x-fill text-sm"></i>
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <i className="ri-linkedin-fill text-sm"></i>
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <i className="ri-youtube-fill text-sm"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
