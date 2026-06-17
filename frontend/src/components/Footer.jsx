import { Link } from 'react-router-dom'
import { Instagram, Youtube, Facebook, MapPin, Phone, Mail, Shield, Truck, RefreshCw, Award } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white mt-20">
      {/* Trust badges */}
      <div className="border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: 'Livraison rapide', sub: '24/48h France métro' },
            { icon: Shield, title: 'Paiement sécurisé', sub: 'Stripe SSL 3D Secure' },
            { icon: RefreshCw, title: 'Retours 30 jours', sub: 'Satisfaction garantie' },
            { icon: Award, title: 'Prix grossiste', sub: 'Sans minimum de commande' },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="p-2 bg-mint-500/10 rounded-lg mt-0.5">
                <Icon size={18} className="text-mint-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-white">{title}</p>
                <p className="text-xs text-navy-300">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="mb-4">
            <span className="font-display font-bold text-xl">Haddley <span className="text-mint-400">&</span> Cooper</span>
            <p className="text-xs text-navy-300 tracking-widest uppercase mt-1">Le pro s'invite chez vous</p>
          </div>
          <p className="text-sm text-navy-300 leading-relaxed mb-4">
            Leader depuis 10 ans dans les produits d'hygiène et d'entretien à prix de grossiste, pour particuliers et professionnels.
          </p>
          <div className="flex gap-3">
            {[
              { href: 'https://www.instagram.com/haddley_cooper', Icon: Instagram },
              { href: 'https://www.youtube.com/@HaddleyCooper', Icon: Youtube },
              { href: 'https://www.facebook.com/profile.php?id=61581627672266', Icon: Facebook },
            ].map(({ href, Icon }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className="p-2 bg-navy-800 rounded-lg hover:bg-mint-500/20 hover:text-mint-400 transition-colors text-navy-300">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Catalogue */}
        <div>
          <h4 className="font-semibold text-white mb-4">Catalogue</h4>
          <ul className="space-y-2 text-sm text-navy-300">
            {['Hygiène des sols', 'Hygiène des surfaces', 'Hygiène des mains', 'Univers Piscine', 'Collecte des déchets', 'Tous les produits'].map(item => (
              <li key={item}><Link to="/catalogue" className="hover:text-mint-400 transition-colors">{item}</Link></li>
            ))}
          </ul>
        </div>

        {/* Infos */}
        <div>
          <h4 className="font-semibold text-white mb-4">Informations</h4>
          <ul className="space-y-2 text-sm text-navy-300">
            {[['Qui sommes-nous ?', '/a-propos'], ['Espace Pro', '/espace-pro'], ['Livraison & retours', '/livraison'], ['Mentions légales', '/mentions-legales'], ['CGV', '/cgv'], ['Contact', '/contact']].map(([label, href]) => (
              <li key={href}><Link to={href} className="hover:text-mint-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-navy-300">
            <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-mint-400 shrink-0" /><span>12 rue de l'Industrie<br/>75010 Paris, France</span></li>
            <li className="flex items-center gap-2"><Phone size={14} className="text-mint-400 shrink-0" /><a href="tel:+33123456789" className="hover:text-mint-400">01 23 45 67 89</a></li>
            <li className="flex items-center gap-2"><Mail size={14} className="text-mint-400 shrink-0" /><a href="mailto:contact@haddley-cooper.fr" className="hover:text-mint-400 text-xs">contact@haddley-cooper.fr</a></li>
          </ul>
          <div className="mt-4 p-3 bg-navy-800 rounded-lg">
            <p className="text-xs text-navy-300">Lun – Ven : 9h – 18h</p>
            <p className="text-xs text-navy-300">Sam : 9h – 12h</p>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-navy-400">
          <p>© {new Date().getFullYear()} Haddley & Cooper. Tous droits réservés.</p>
          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4 opacity-50" />
            <span>Paiement 100% sécurisé</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
