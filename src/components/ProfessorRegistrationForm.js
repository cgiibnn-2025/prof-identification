import React, { useState } from 'react';
import { API_BASE_URL, SERVER_URL } from '../config';
import '../styles/ProfessorRegistrationForm.css';
import { FaUser, FaGraduationCap, FaBook, FaFileAlt, FaPhone, FaCheckCircle, FaEye } from 'react-icons/fa';
import LoadingModal from './LoadingModal';

const UNIVERSITIES = [
  { code: "ISAU-KIN", name: "Institut Supérieur d'Architecture et d'Urbanisme" },
  { code: "UNIKIN", name: "Université de Kinshasa" },
  { code: "I.N.B.T.P", name: "Institut National de Bâtiment et Travaux Publics" },
  { code: "UNISIC", name: "Université des Sciences de l'Information et de la Communication" },
  { code: "UPN", name: "Université Pédagogique Nationale" },
  { code: "HEC-KIN", name: "HAUTE ECOLE DE COMMERCE DE KINSHASA" },
  { code: "ISS-KIN", name: "Institut supérieur de statistiques de Kinshasa" },
  { code: "ISAM", name: "Institut Supérieur des Arts et Métiers" },
  { code: "ISP-GOMBE", name: "Institut Supérieur Pédagogique de la Gombe" },
  { code: "ISTM-KIN", name: "ISTM KINSHASA" },
  { code: "ISPT-KIN", name: "Institut Supérieur Pédagogique Technique de Kinshasa" },
  { code: "ABA-KIN", name: "Académie des beaux-arts de Kinshasa" },
  { code: "INA", name: "Institut National des Arts" },
  { code: "ISTA-KIN", name: "Institut Supérieur de Techniques Appliquées de Kinshasa" },
  { code: "UNIGOM", name: "Université de Goma" },
  { code: "UNIKIS", name: "Université de Kisangani" },
  { code: "UNILU", name: "Université de Lubumbashi" },
  { code: "ISET-KKT", name: "L'institut superieur d'enseignement technique de kikwit" },
  { code: "ISDR-T", name: "Institut Supérieur de Développement Rural de Tshibashi/Kananga" },
  { code: "ISC-LUSHI", name: "Institut supérieur de commerce de Lubumbashi" },
  { code: "UMD-MPITO", name: "Université de Mwene-Ditu" },
  { code: "UNIKI", name: "Université de Kindu" },
  { code: "UNIBAND", name: "Université de Bandundu" },
  { code: "ISTM-BKV", name: "Institut Supérieur des Techniques Médicales/Bukavu" },
  { code: "ISDR-MBK", name: "Institut Supérieur de Développement Rural de Mbandaka" },
  { code: "ISC-ILEBO", name: "Institut supérieur de commerce de Ilebo" },
  { code: "IBTP-MATADI", name: "institut du bâtiment et des travaux publics de Matadi" },
  { code: "UNIBAC", name: "Université Baptiste du Congo" },
  { code: "UNIKOL", name: "Université de Kolwezi" },
  { code: "ISTM-BDD", name: "Institut Supérieur des Techniques Médicales/Bandundu" },
  { code: "ISP-MBKA", name: "Institut Supérieur Pédagogique de Mbandaka" },
  { code: "ISC-BENI", name: "Institut supérieur de commerce de Beni" },
  { code: "UNILUK", name: "Université Adventiste de LUKANGA" },
  { code: "upkan", name: "Université Pédagogique de Kananga" },
  { code: "ISTM-KINDU", name: "Institut Supérieur des Techniques Médicales/Kindu" },
  { code: "IBTP-KIS", name: "institut du bâtiment et des travaux publics de Kisangani" },
  { code: "ISC-BDD", name: "Institut supérieur de commerce de Bandundu" },
  { code: "ISP-MATADI", name: "institut supérieur pédagogique de Matadi" },
  { code: "UNIKIK", name: "Université de Kikwit" },
  { code: "UKV-BOMA", name: "UKV-BOMA" },
  { code: "ISTM-KLD", name: "Institut Supérieur de Technique Médicale de Kalenda" },
  { code: "ISP-BENI", name: "Institut supérieur pédagogique de Beni" },
  { code: "ISTM-BENI", name: "Institut Supérieur des Techniques Médicales de Béni" },
  { code: "ISDR-Goma", name: "Institut Supérieur de Développement Rural des Grands-Lacs (ISDR-GL)" },
  { code: "USB", name: "Université Shalom de Bunia" },
  { code: "UOR", name: "Université Officielle de Ruwenzori" },
  { code: "ISAM-LUBERO", name: "ISAM-LUBERO" },
  { code: "ISTM-WALIKALE", name: "INSTITUT SUPERIEUR DES TECHNIQUES MEDICALES DE WALIKALE" },
  { code: "ULPG", name: "Université Libre des Pays des Grands" },
  { code: "UEPI", name: "Université Evangélique pour le Progrès en Ituri" },
  { code: "UNIC-GOMA", name: "UNIVERSITE DU CEPROMAD DE GOMA" },
  { code: "UNIBU", name: "Université de Bunia" },
  { code: "UAC", name: "UNIVERSITE ANGLICANE DU CONGO" },
  { code: "UAGO", name: "Université Adventiste de Goma" },
  { code: "UCS-GOMA", name: "UNIVERSIE CATHOLIQUE LA SAPIENTIA DE GOMA" },
  { code: "ISTS-GOMA", name: "INSTITUT SUPERIEUR TECHNIQUE ET SOCIAL" },
  { code: "ISTAGO", name: "Institut Supérieur Technique Adventiste de Goma" },
  { code: "ISP-NYIRAGONGO", name: "INSTITUT SUPERIEUR PEDAGOGIQUE DE NYIRAGONGO" },
  { code: "ISP-MUHANGI", name: "Institut Supérieur Pédagogique de MUHANGI" },
  { code: "ISP-GOMA", name: "Institut Supérieur Pédagogique de Goma" },
  { code: "ISP-GETY", name: "INSTITUT SUPERIEUR PEDAGOGIQUE DE GETY" },
  { code: "INSTITUT SUPERIEUR PEDAGOGIQUE DE BUNIA", name: "INSTITUT SUPERIEUR PEDAGOGIQUE DE BUNIA" },
  { code: "ISP-CECA20-BUNIA", name: "Institut Supérieur Pédagogique CECA 20 BUNIA" },
  { code: "ISP-WALIKALE", name: "Institut Supérieur Pédagogie de Walikale" },
  { code: "ISTM-NYAKUNDE", name: "Institut Supérieur des Techniques Médicales de Nyankunde" },
  { code: "ISTM-MASISI", name: "INSTITUT SUPERIEUR DES TECHNIQUES MEDICALES DE MASISI" },
  { code: "ISTM-BUNIA", name: "INSTITUT SUPERIEUR DES TECHNIQUES MEDICALES DE BUNIA" },
  { code: "ISTGA", name: "Institut supérieur des techniques de gestion des affaires de goma" },
  { code: "ISSIGE-BUNIA", name: "INSTITUT SUPERIEUR DES SCIENCES INFORMATIQUES ET DE GESTION DE BUNIA" },
  { code: "ISETM-VIRUNGA", name: "Institut Supérieur d'Enseignement des Techniques Médicales-Virunga" },
  { code: "ISTOU-GOMA", name: "INSTITUT SUPERIEUR DE TOURISME DE GOMA" },
  { code: "ISSNT-GOMA", name: "Institut Supérieur de Statistique et de Nouvelles Technologies" },
  { code: "ISLG-BUNIA", name: "INSTITUT SUPERIEUR DE SCIENCES RELIGIEUSES JOSEPH MUKASA BUNIA" },
  { code: "ISMGL-GOMA", name: "INSTITUT SUPERIEUR DE MANAGEMENT DES GRANDS LACS GOMA" },
  { code: "ISDR-BUNIA", name: "INSTITUT SUPERIEUR DE DEVELOPPEMENT RURAL DE BUNIA" },
  { code: "ISDKY", name: "Institut Supérieur de Développement et d'Entrepreneuriat de Kyavirimu" },
  { code: "ISC-GOMA", name: "INSTITUT SUPERIEUR DE COMMERCE DE GOMA" },
  { code: "ISESOD-GOMA", name: "INSTITUT SUPÉRIEUR D'ENVIRONNEMENT SOLIDAIRE ET DE DÉVELOPPEMENT DURABLE" },
  { code: "IBTP-BUNIA", name: "Institut du Bâtiment et Travaux Publics de Bunia" },
  { code: "ISTM-GOMA", name: "INSTITUT SUPERIEUR DE TECHNIQUE MEDIALE DE GOMA" },
  { code: "USB-BUNIA", name: "Université Shalom Bunia" },
  { code: "U.O.R", name: "Université Officielle Ruwenzori" },
  { code: "U.S.B-BUNIA", name: "Université Shalom" },
  { code: "ISTA Ndoluma", name: "Institut Supérieur des Techniques Appliquées de Ndoluma à Lubero" },
  { code: "UCG Butembo", name: "Université Catholique du graben de Butembo" },
  { code: "ISC-BUTEMBO", name: "Institut Supérieur de Commerce de Butembo" },
  { code: "ULD Butembo", name: "Université Libre de Développement de Butembo" },
  { code: "ISTM Loyola", name: "Institut Supérieur des Techniques Médicales Loyola" },
  { code: "IBTP Butembo", name: "Institut du Batiment et Travaux Publics Butembo" },
  { code: "ISTM Lukanga", name: "Institut Supérieur des Techniques Médicales de Lukanga" },
  { code: "ISTA Lukanga", name: "Institut Supérieur Technique de Lukanga" },
  { code: "USCM Mulo", name: "Université Sainte Croix de Mulo" },
  { code: "UAC Butembo", name: "Université de l'Assomption au Congo de Butembo" },
  { code: "FAB", name: "Faculté Africaines Bakhita" },
  { code: "ISDR Kitsumbiro", name: "Institut Supérieur de Développement Rural de Kitsombiro" },
  { code: "ISEAVF Butembo", name: "Institut Supérieur d Etudes Agronomiques Vétérinaires et Forestières de Butembo" },
  { code: "UEMA Butembo", name: "Université Evangélique de la Mission en Afrique de Butembo" },
  { code: "ISPT Muhangi", name: "Institut Supérieur Pédagogique et Techniques de Muhangi" },
  { code: "ULPGL Butembo", name: "Université Libre des Pays des Grands Lacs de Butembo" },
  { code: "UNIC Butembo", name: "2 Université du CEPROMAD de Butembo" },
  { code: "ISP Kirumba", name: "Institut Supérieur Pédagogique de Kirumba" },
  { code: "ISCA Butembo", name: "Institut Supérieur de Chimie Appliquée de Butembo" },
  { code: "UDGB Butembo", name: "Université Diviba Gloria de Butembo" },
  { code: "ISTM Kyondo", name: "Institut Supérieur des Techniques Médicales de Kyondo" },
  { code: "ISP Masereka", name: "Institut Supérieur Pédagogique de Masereka" },
  { code: "UTAB", name: "Université Technologique Africaine de Butungera" },
  { code: "ISTA Butembo", name: "Institut Supérieur des Techniques Appliquées de Butembo" },
  { code: "ISDR Kanyabayonga", name: "Institut Supérieur de Développement Rural de Kanyabayonga" },
  { code: "STM Kayna", name: "2 Institut Supérieur des Techniques Médicales de Kayna" },
  { code: "ISEAVF Kirumba", name: "Institut Supérieur d Etudes Agronomiques Veterinaires et Forestieres de Kirumba" },
  { code: "UCNDK", name: "Université de Conservation de la Nature et de développement de Kasugho" },
  { code: "UNIDEC Muhangi", name: "Université de Développement au Congo à Muhangi" },
  { code: "UIC Butemb", name: "Université Islamique du Congo à Butembo" },
  { code: "ISTAPT Kyavinyonge", name: "Institut Supérieur Technique d'Aquaculture de Pêche et de Tourisme de Kyavinyonge" },
  { code: "UOS", name: "Université Officielle de Semuliki" },
  { code: "ISC-BUKAVU", name: "Institut Supérieur de Commerce de Bukavu" },
  { code: "UOB", name: "Université Officiel de Bukavu" },
  { code: "ISDR Beni", name: "Institut Supérieur de Développement Rural de Beni" },
  { code: "ISP Oicha", name: "Institut Supérieur Pédagogique d' Oicha" },
  { code: "UPM", name: "Université Pic Margeurite de Mwenda" },
  { code: "UCBC Beni", name: "Université Chrétienne Bilingue du Congo de Beni" },
  { code: "UAC Beni", name: "Université de l'Assomption du Congo de Beni" },
  { code: "UEB Beni", name: "Université Evangélique de Beni" },
  { code: "UAAC Beni", name: "Université Anglicane en afrique Centrale à Beni" },
  { code: "UNIC Beni", name: "Université du CEPROMAD de Beni" },
  { code: "ISTM Oicha", name: "Institut Supérieur des Techniques Médicales d' Oicha" },
  { code: "ISTAD Beni", name: "Institut Supérieur des Techniques Appliquées et de Développement de Beni" },
  { code: "ISTD Kasindi", name: "Institut Supérieur des Techniques de Développement de Kasindi" },
  { code: "ISSTDD Mbau", name: "Institut Supérieur des Sciences Techniques et de Développement Durable de Mbau" },
  { code: "ISTGD Kasindi", name: "Institut Supérieur des Techniques de Gestion et de Développement de Kasindi" },
  { code: "ISTM Mangina", name: "Institut Supérieur des Techniques Médicales de Mangina" },
  { code: "ISP Ruw", name: "Institut Supérieur Pédagogique de Ruwenzori" },
  { code: "ISBN de Beni", name: "Institut Supérieur du Bassin du Nil" },
  { code: "ISEAVF Cantine", name: "Institut Supérieur d Etudes Agronomiques Veterinaires et Forestieres de Cantine" },
  { code: "Unio", name: "Universite d' Oicha" },
  { code: "ISC UVIRA", name: "INSTITUT SUPERIEUR DE COMMERCE  UVIRA" },
  { code: "ISDR-FIZI", name: "INSTITUT SUPERIEUR DE DEVELOPPEMENT RURAL DE FIZI" },
  { code: "ISDR BUKAVU", name: "INSTITUT SUPERIEUR DE DEVLOPPEMENT RURAL BUKAVU" },
  { code: "ISDR  KAZIBA", name: "ISDR  KAZIBA" },
  { code: "ISDR WALIKALE", name: "INSTITUT SUPERIEUR DE DEVLOPPEMENT RURAL  WALIKALE" },
  { code: "ISP  DE KAZIBA", name: "ISP  DE KAZIBA" },
  { code: "ISP-KIKWIT", name: "INSTITUT SUPERIEUR  PEDAGOGIQUE  KIKWIT" },
  { code: "ISP  MBANZA-NGUNGU", name: "INSTITUT SUPERIEUR  PEDAGOGIQUE  MBANZA-NGUNGU" },
  { code: "ISP IDJWI", name: "INSTITUT SUPERIEUR D'IDJWI" },
  { code: "ISPF-BUKAVU", name: "INSTITUT SUPERIEUR DE PASTORALE FAMILIALE DE BUKAVU" },
  { code: "ISPT BUKAVU", name: "INSTITUT SEPERIEUR PEDAGOGIQUE ET TECHNIQUE BUKAVU" },
  { code: "ISECOF-BUKAVU", name: "Institut Supérieur d'Etudes Commerciales et Financières de Bukavu" },
  { code: "ISC Matadi", name: "ISC Matadi" },
  { code: "ISTM-ILEBO", name: "Institut Supérieur des Techniques Médicales d'ILEBO" },
  { code: "ISP-ILEBO", name: "Institut Supérieur Pédagogique d'ILEBO" },
  { code: "ISTM-NYANGEZI", name: "INSTITUT SUPERIEUR DES TECHNIQUES MEDICAIES NYANGEZI" },
  { code: "UBC-BUKAVU", name: "Université Bilingue du Congo-BUKAVU" },
  { code: "ISTD-MULUNGU", name: "Institut Supérieur des Techniques de Développement de Mulungu" },
  { code: "CUM", name: "CENTRE TINIVERSITAIRE DE MINEMBWE" },
  { code: "ISTM-KANYAMULANDE", name: "INSTITUT SUPERIEUR DES TECHNIQUES MEDICALES DE KANYAMULANDE" },
  { code: "UNIKAZ", name: "Université de KAZIBA" },
  { code: "ULGL-BKV", name: "Université Libre de Grands Lacs de Bukavu" },
  { code: "IT PIB", name: "IT Philosophat Isidore Bakanja" },
  { code: "UNI50-LWIRO", name: "UNIVERSITE DU CINQUANTENAIRE DE LWIRO" },
  { code: "uea-bukavu", name: "Université Evangélique en Afrique" },
  { code: "UEAGL", name: "Université d'Excellence pour l'Afrique des Grands Lacs" },
  { code: "ISTA-KOLWEZI", name: "ISTA-KOLWEZI" },
  { code: "ISTM-ISIRO", name: "Institut Supérieur des Techniques Médicales d'ISIRO" },
  { code: "ISP-KIROTCHE", name: "Institut Supérieur Pédagogique de Kirotche" },
  { code: "ABA", name: "Académie des beaux-arts de Kinshasa" },
  { code: "ISS", name: "Institut supérieur de statistiques de Kinshasa" },
  { code: "HEC", name: "Haute École de Commerce de Kinshasa" },
  { code: "INBTP", name: "Institut National de Bâtiment et Travaux Publics" },
  { code: "ISAU", name: "Institut Supérieur d'Architecture et d'Urbanisme" },
  { code: "ISTA", name: "Institut Supérieur de Techniques Appliquées de Kinshasa" },
  { code: "ISTM", name: "ISTM Kinshasa" },
  { code: "UNIKIN-UELE", name: "Université de l'Uélé" },
  { code: "ISP-BONDO", name: "Institut Supérieur Pédagogique de Bondo" },
  { code: "ISP-BUTA", name: "Institut Supérieur Pédagogique de Buta" },
  { code: "ISTM-BUTA", name: "ISTM Buta" },
  { code: "IBTP-BUTA", name: "IBTP Buta" },
  { code: "ISC-BUTA", name: "Institut Supérieur de Commerce de Buta" },
  { code: "ISDR-AMADI-POKO", name: "ISDR Amadi Poko" },
  { code: "U-MBANDAKA", name: "Université de Mbandaka" },
  { code: "ISP-MBANDAKA", name: "ISP Mbandaka" },
  { code: "ISDR-MBANDAKA", name: "ISDR Mbandaka" },
  { code: "ISPPECHE-MBANDAKA", name: "Institut Supérieur de Pêche de Mbandaka" },
  { code: "ISTM-BASANKUSU", name: "ISTM Basankusu" },
  { code: "ISTM-MBANDAKA", name: "ISTM Mbandaka" },
  { code: "ISIB-BASANKUSU", name: "Institut Supérieur de l'Industrie du Bois (ISIB) Basankusu" },
  { code: "ISP-BOKUNGU", name: "ISP Bokungu" },
  { code: "ISDR-BOSONDJO", name: "ISDR Bosondjo" },
  { code: "UNILIK", name: "Université de Likasi" },
  { code: "ISP-LUBUMBASHI", name: "ISP Lubumbashi" },
  { code: "ISTA-LUBUMBASHI", name: "ISTA Lubumbashi" },
  { code: "ISS-LUBUMBASHI", name: "ISS Lubumbashi" },
  { code: "ISC-LUBUMBASHI", name: "ISC Lubumbashi" },
  { code: "ISTM-LUBUMBASHI", name: "ISTM Lubumbashi" },
  { code: "ISES-LUBUMBASHI", name: "ISES Lubumbashi" },
  { code: "ISPT-LIKASI", name: "ISPT Likasi" },
  { code: "ISP-MITWABA", name: "ISP Mitwaba" },
  { code: "ISTM-MITWABA", name: "ISTM Mitwaba" },
  { code: "ISP-PWETO", name: "ISP Pweto" },
  { code: "UNIKAM", name: "Université de Kamina" },
  { code: "UNIMALEMBANKULU", name: "Université de Malemba-Nkulu" },
  { code: "ISTM-KAMINA", name: "ISTM Kamina" },
  { code: "ISTM-MULONGU", name: "ISTM Mulungu" },
  { code: "ISDR-KONGOLO", name: "ISDR Kongolo" },
  { code: "ISP-KANAMA", name: "ISP Kanama" },
  { code: "ISP-KABONGO", name: "ISP Kabongo" },
  { code: "ISP-KAMINA", name: "ISP Kamina" },
  { code: "ISP-MALEMBA-NKULU", name: "ISP Malemba Nkulu" },
  { code: "ISP-FARADJE", name: "ISP Faradje" },
  { code: "ISP-ISIRO", name: "ISP Isiro" },
  { code: "ISP-WATSA", name: "ISP Watsa" },
  { code: "ISC-ISIRO", name: "ISC Isiro" },
  { code: "ISTM-WAMBA", name: "ISTM Wamba" },
  { code: "ISDR-WATSA", name: "ISDR Watsa" },
  { code: "ISDR-MAKORO", name: "ISDR Makoro" },
  { code: "ISTD-DUNGU", name: "ISTD Dungu" },
  { code: "ISTM-KIBALI-DUNGU", name: "ISTM Kibali Dungu" },
  { code: "ISTD-LEGU", name: "ISTD Legu" },
  { code: "AUTRES", name: "Autres" },
];

const ProfessorRegistrationForm = () => {
  const [formData, setFormData] = useState({
    nom: '',
    postnom: '',
    prenom: '',
    sexe: '',
    matricule_esu: '',
    lieu_naissance: '',
    date_naissance: '',
    grade_actuel: '',
    pays_soutenance: '',
    universite_soutenance: '',
    numero_arrete_equivalence: '',
    copie_arrete_equivalence: null,
    date_soutenance: '',
    type_diplome: '',
    universite_attache: '',
    universite_attache_precisee: '',
    email: '',
    telephone: '',
    reference_dernier_arrete: '',
    prime_institutionnelle: '',
    salaire_base: '',
    photo_identite: null,
    possede_diplome: '',
    copie_diplome: null,
    documents_equivalents: null,
    domaine_recherche: '',
    sujet_these: '',
    copie_these: null,
    commentaire_confirmation: '',
    informations_vraies: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewMatricule, setViewMatricule] = useState('');
  const [viewLoading, setViewLoading] = useState(false);
  const [viewedData, setViewedData] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState(''); // 'error', 'info', 'success'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [changedFields, setChangedFields] = useState({});

  const showPopup = (msg, type = 'info') => {
    setPopupMessage(msg);
    setPopupType(type);
    setTimeout(() => {
      setPopupMessage('');
      setPopupType('');
    }, 4000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData({
      ...formData,
      [name]: newValue,
    });
    if (editMode) {
      setChangedFields({
        ...changedFields,
        [name]: newValue,
      });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0],
      });
      if (editMode) {
        setChangedFields({
          ...changedFields,
          [name]: files[0],
        });
      }
    }
  };

  const handleViewData = async () => {
    if (!viewMatricule.trim()) {
      showPopup('Veuillez entrer un matricule ESU', 'error');
      return;
    }

    setViewLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}enseignant/${viewMatricule}/`, {
        signal: AbortSignal.timeout(60000),
      });
      
      if (!response.ok) {
        throw new Error('Professeur non trouvé');
      }

      const data = await response.json();
      setViewedData(data);
    } catch (error) {
      let errorMsg = 'Erreur lors de la recherche';
      if (error.name === 'AbortError') {
        errorMsg = 'La requête a expiré. Veuillez réessayer.';
      } else if (error.message === 'Failed to fetch') {
        console.error('Erreur de connexion réseau lors de la recherche');
        return;
      } else {
        errorMsg = error.message;
      }
      showPopup(errorMsg, 'error');
      setViewedData(null);
      console.error('Erreur complète:', error);
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewMatricule('');
    setViewedData(null);
  };

  const handleDeleteProfessor = async () => {
    const retryFetch = async (url, options, maxRetries = 2) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          const response = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(60000),
          });
          return response;
        } catch (error) {
          if (i === maxRetries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    };

    try {
      const response = await retryFetch(`${API_BASE_URL}enseignant/delete/${viewMatricule}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      showPopup('Professeur supprimé avec succès', 'success');
      setShowDeleteConfirm(false);
      handleCloseViewModal();
    } catch (error) {
      let errorMsg = 'Erreur lors de la suppression';
      if (error.name === 'AbortError') {
        errorMsg = 'La requête a expiré';
      } else if (error.message === 'Failed to fetch') {
        console.error('Erreur de connexion réseau lors de la suppression');
        return;
      }
      showPopup(errorMsg, 'error');
      console.error('Erreur complète:', error);
    }
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleStartEdit = () => {
    setEditMode(true);
    setFormData({
      nom: viewedData.nom || '',
      postnom: viewedData.postnom || '',
      prenom: viewedData.prenom || '',
      sexe: viewedData.sexe || '',
      matricule_esu: viewedData.matricule_esu || '',
      lieu_naissance: viewedData.lieu_naissance || '',
      date_naissance: viewedData.date_naissance || '',
      grade_actuel: viewedData.grade_actuel || '',
      pays_soutenance: viewedData.pays_soutenance || '',
      universite_soutenance: viewedData.universite_soutenance || '',
      numero_arrete_equivalence: viewedData.numero_arrete_equivalence || '',
      copie_arrete_equivalence: null,
      date_soutenance: viewedData.date_soutenance || '',
      type_diplome: viewedData.type_diplome || '',
      universite_attache: viewedData.universite_attache || '',
      universite_attache_precisee: viewedData.universite_attache_precisee || '',
      email: viewedData.email || '',
      telephone: viewedData.telephone || '',
      reference_dernier_arrete: viewedData.reference_dernier_arrete || '',
      prime_institutionnelle: viewedData.prime_institutionnelle || '',
      salaire_base: viewedData.salaire_base || '',
      photo_identite: null,
      possede_diplome: viewedData.possede_diplome || '',
      copie_diplome: null,
      documents_equivalents: null,
      domaine_recherche: viewedData.domaine_recherche || '',
      sujet_these: viewedData.sujet_these || '',
      copie_these: null,
      commentaire_confirmation: viewedData.commentaire_confirmation || '',
      informations_vraies: viewedData.informations_vraies || false,
    });
    setChangedFields({});
    setShowViewModal(false);
  };

  const handleEditProfessor = async () => {
    const retryFetch = async (url, options, maxRetries = 2) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          const response = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(45000),
          });
          return response;
        } catch (error) {
          if (i === maxRetries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    };

    try {
      const submitData = new FormData();

      // Ajouter uniquement les champs modifiés
      Object.keys(changedFields).forEach((key) => {
        if (changedFields[key] instanceof File) {
          // Pour les fichiers
          submitData.append(key, changedFields[key]);
        } else if (changedFields[key] !== null && changedFields[key] !== undefined) {
          // Pour les champs texte et autres
          submitData.append(key, changedFields[key]);
        }
      });

      const response = await retryFetch(`${API_BASE_URL}enseignant/edit/${viewMatricule}/`, {
        method: 'PATCH',
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la modification');
      }

      await response.json();
      showPopup('Professeur modifié avec succès', 'success');
      setEditMode(false);
      setChangedFields({});
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        postnom: '',
        prenom: '',
        sexe: '',
        matricule_esu: '',
        lieu_naissance: '',
        date_naissance: '',
        grade_actuel: '',
        pays_soutenance: '',
        universite_soutenance: '',
        numero_arrete_equivalence: '',
        copie_arrete_equivalence: null,
        date_soutenance: '',
        type_diplome: '',
        universite_attache: '',
        universite_attache_precisee: '',
        email: '',
        telephone: '',
        reference_dernier_arrete: '',
        prime_institutionnelle: '',
        salaire_base: '',
        photo_identite: null,
        possede_diplome: '',
        copie_diplome: null,
        documents_equivalents: null,
        domaine_recherche: '',
        sujet_these: '',
        copie_these: null,
        commentaire_confirmation: '',
        informations_vraies: false,
      });
    } catch (error) {
      let errorMsg = 'Erreur lors de la modification';
      if (error.name === 'AbortError') {
        errorMsg = 'La requête a expiré';
      } else if (error.message === 'Failed to fetch') {
        console.error('Erreur de connexion réseau lors de la modification');
        return;
      }
      showPopup(errorMsg, 'error');
      console.error('Erreur complète:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(''); // Effacer les messages précédents
    setMessageType(''); // Réinitialiser le type

    const retryFetch = async (url, options, maxRetries = 2) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          const response = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(45000), // 45 secondes timeout pour POST
          });
          return response;
        } catch (error) {
          if (i === maxRetries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Attendre avant retry
        }
      }
    };

    try {
      // Créer FormData pour multipart/form-data
      const submitData = new FormData();

      // Ajouter les champs texte
      Object.keys(formData).forEach((key) => {
        if (
          key !== 'photo_identite' &&
          key !== 'copie_diplome' &&
          key !== 'copie_these' &&
          key !== 'copie_arrete_equivalence' &&
          key !== 'documents_equivalents'
        ) {
          submitData.append(key, formData[key]);
        }
      });

      // Ajouter les fichiers
      if (formData.photo_identite) {
        submitData.append('photo_identite', formData.photo_identite);
      }
      if (formData.copie_diplome) {
        submitData.append('copie_diplome', formData.copie_diplome);
      }
      if (formData.copie_these) {
        submitData.append('copie_these', formData.copie_these);
      }
      if (formData.copie_arrete_equivalence) {
        submitData.append('copie_arrete_equivalence', formData.copie_arrete_equivalence);
      }
      if (formData.documents_equivalents) {
        submitData.append('documents_equivalents', formData.documents_equivalents);
      }

      // Debug: Log les données envoyées
      console.log('Données envoyées au serveur:');
      for (let [key, value] of submitData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      console.log(`URL: ${API_BASE_URL}enseignant/add/`);

      const response = await retryFetch(`${API_BASE_URL}enseignant/add/`, {
        method: 'POST',
        body: submitData,
        // Ne pas ajouter de Content-Type, FormData le fait automatiquement
        // Ne pas ajouter de headers personnalisés qui déclencheraient une requête preflight
      });

      if (response.ok) {
        const result = await response.json();
        setMessageType('success');
        const successMessage = result.message || 'Professeur créé avec succès';
        const detailsMessage = result.data && result.data.id 
          ? ` - ID: ${result.data.id}${result.data.matricule_esu ? `, Matricule: ${result.data.matricule_esu}` : ''}`
          : '';
        setMessage(successMessage + detailsMessage);
        console.log('✅ Enregistrement réussi:', result);
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          postnom: '',
          prenom: '',
          sexe: '',
          matricule_esu: '',
          lieu_naissance: '',
          date_naissance: '',
          grade_actuel: '',
          pays_soutenance: '',
          universite_soutenance: '',
          numero_arrete_equivalence: '',
          copie_arrete_equivalence: null,
          date_soutenance: '',
          type_diplome: '',
          universite_attache: '',
          universite_attache_precisee: '',
          email: '',
          telephone: '',
          reference_dernier_arrete: '',
          prime_institutionnelle: '',
          salaire_base: '',
          photo_identite: null,
          possede_diplome: '',
          copie_diplome: null,
          documents_equivalents: null,
          domaine_recherche: '',
          sujet_these: '',
          copie_these: null,
          commentaire_confirmation: '',
          informations_vraies: false,
        });
        setLoading(false);
        return;
      } else {
        let errorMsg = 'Une erreur est survenue lors de la création du professeur';
        try {
          const result = await response.json();
          errorMsg = result.message || errorMsg;
        } catch (e) {
          // Si la réponse n'est pas du JSON valide
          errorMsg = `Erreur HTTP ${response.status}: ${response.statusText}`;
        }
        setMessageType('error');
        setMessage(errorMsg);
        console.error('❌ Erreur serveur:', response.status, errorMsg);
        setLoading(false);
        return;
      }
    } catch (error) {
      setMessageType('error');
      let errorMsg = 'Erreur lors de l\'enregistrement';
      
      console.error('=== ERREUR COMPLÈTE ===');
      console.error('Nom:', error.name);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      
      if (error.name === 'AbortError') {
        errorMsg = 'La requête a expiré. Veuillez réessayer.';
      } else if (error.message === 'Failed to fetch') {
        // Ignorer silencieusement les erreurs de connexion réseau
        console.error('Erreur de connexion réseau détectée');
        return;
      } else if (error.message && error.message.includes('CORS')) {
        errorMsg = 'Erreur CORS : Le serveur n\'autorise pas l\'accès depuis ce domaine.';
      } else if (error.message && error.message.includes('JSON')) {
        errorMsg = 'Erreur : Réponse invalide du serveur (JSON malformé).';
      } else {
        errorMsg = error.message || 'Erreur inconnue';
      }
      
      setMessage(errorMsg);
      console.error('❌ Message d\'erreur affiché:', errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="professor-registration-form">
      <div className="form-header">
        <div className="header-content">
          <div className="header-logo">
            <img src="/app-logo.png" alt="Logo MINESURSI" />
          </div>
          <div className="header-text">
            <h1>Registre d'Identification des Professeurs</h1>
            <h2>Corps académique du MINESURSI</h2>
          </div>
        </div>
      </div>

      {message && (
        <div className={`message message-${messageType}`}>
          {message}
        </div>
      )}

      {popupMessage && (
        <div className={`popup-message popup-${popupType}`}>
          {popupMessage}
        </div>
      )}

      <div className="form-toolbar">
        <button 
          type="button"
          className="btn-view-data"
          onClick={() => setShowViewModal(true)}
        >
          <FaEye /> Voir vos données
        </button>
      </div>

      {editMode && (
        <div className="edit-mode-banner">
          Mode édition activé pour le professeur: {viewMatricule}
        </div>
      )}

      <form onSubmit={editMode ? (e) => { e.preventDefault(); handleEditProfessor(); } : handleSubmit} encType="multipart/form-data">
        {/* Section Informations Personnelles */}
        <fieldset>
          <legend><FaUser /> Informations Personnelles</legend>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom">Nom <span className="required">*</span></label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="postnom">Postnom <span className="required">*</span></label>
              <input
                type="text"
                id="postnom"
                name="postnom"
                value={formData.postnom}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prenom">Prénom <span className="required">*</span></label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sexe">Sexe <span className="required">*</span></label>
              <select
                id="sexe"
                name="sexe"
                value={formData.sexe}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Sélectionner --</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="lieu_naissance">Lieu de Naissance <span className="required">*</span></label>
            <input
              type="text"
              id="lieu_naissance"
              name="lieu_naissance"
              value={formData.lieu_naissance}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date_naissance">Date de Naissance <span className="required">*</span></label>
            <input
              type="date"
              id="date_naissance"
              name="date_naissance"
              value={formData.date_naissance}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="telephone">Téléphone <span className="required">*</span></label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              required
            />
          </div>
        </fieldset>

        {/* Section Informations de Contact */}
        <fieldset>
          <legend><FaPhone /> Informations de Contact</legend>

          <div className="form-group">
            <label htmlFor="email">Email <span className="optional">(optionnel)</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
        </fieldset>

        {/* Section Informations Académiques */}
        <fieldset>
          <legend><FaGraduationCap /> Informations Académiques</legend>

          <div className="form-group">
            <label htmlFor="matricule_esu">Matricule ESU <span className="required">*</span></label>
            <input
              type="text"
              id="matricule_esu"
              name="matricule_esu"
              value={formData.matricule_esu}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="grade_actuel">Grade Actuel <span className="required">*</span></label>
            <select
              id="grade_actuel"
              name="grade_actuel"
              value={formData.grade_actuel}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Sélectionner --</option>
              <option value="PE">Professeur Extraordinaire</option>
              <option value="PO">Professeur Ordinaire</option>
              <option value="P">Professeur</option>
              <option value="PA">Professeur Associé</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="universite_attache">Université d'Attache <span className="required">*</span></label>
            <select
              id="universite_attache"
              name="universite_attache"
              value={formData.universite_attache}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Sélectionner --</option>
              {UNIVERSITIES.map((uni) => (
                <option key={uni.code} value={uni.code}>
                  {uni.name}
                </option>
              ))}
            </select>
          </div>

          {formData.universite_attache === 'AUTRES' && (
            <div className="form-group">
              <label htmlFor="universite_attache_precisee">Préciser l'université <span className="required">*</span></label>
              <input
                type="text"
                id="universite_attache_precisee"
                name="universite_attache_precisee"
                value={formData.universite_attache_precisee}
                onChange={handleInputChange}
                required={formData.universite_attache === 'AUTRES'}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="domaine_recherche">Domaine de Recherche <span className="required">*</span></label>
            <input
              type="text"
              id="domaine_recherche"
              name="domaine_recherche"
              value={formData.domaine_recherche}
              onChange={handleInputChange}
              required
            />
          </div>
        </fieldset>

        {/* Section Informations de Soutenance */}
        <fieldset>
          <legend><FaBook /> Informations de Soutenance</legend>

          <div className="form-group">
            <label htmlFor="type_diplome">Type de Diplôme <span className="required">*</span></label>
            <select
              id="type_diplome"
              name="type_diplome"
              value={formData.type_diplome}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Sélectionner --</option>
              <option value="Academique">Académique</option>
              <option value="Professionnel">Professionnel</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sujet_these">Sujet de Thèse <span className="required">*</span></label>
            <textarea
              id="sujet_these"
              name="sujet_these"
              value={formData.sujet_these}
              onChange={handleInputChange}
              rows="3"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="universite_soutenance">Université de Soutenance <span className="required">*</span></label>
            <input
              type="text"
              id="universite_soutenance"
              name="universite_soutenance"
              value={formData.universite_soutenance}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pays_soutenance">Pays de Soutenance <span className="required">*</span></label>
            <input
              type="text"
              id="pays_soutenance"
              name="pays_soutenance"
              value={formData.pays_soutenance}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date_soutenance">Date de Soutenance <span className="required">*</span></label>
            <input
              type="date"
              id="date_soutenance"
              name="date_soutenance"
              value={formData.date_soutenance}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="numero_arrete_equivalence">Numéro Arrêté Équivalence <span className="optional">(optionnel)</span></label>
            <input
              type="text"
              id="numero_arrete_equivalence"
              name="numero_arrete_equivalence"
              value={formData.numero_arrete_equivalence}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="copie_arrete_equivalence">Copie Arrêté Équivalence <span className="optional">(optionnel)</span></label>
            <input
              type="file"
              id="copie_arrete_equivalence"
              name="copie_arrete_equivalence"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </div>
        </fieldset>

        {/* Section Informations Administratives */}
        <fieldset>
          <legend><FaFileAlt /> Informations Administratives</legend>

          <div className="form-group">
            <label htmlFor="reference_dernier_arrete">Référence Dernier Arrêté <span className="required">*</span></label>
            <input
              type="text"
              id="reference_dernier_arrete"
              name="reference_dernier_arrete"
              value={formData.reference_dernier_arrete}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="prime_institutionnelle">Prime Institutionnelle <span className="required">*</span></label>
            <select
              id="prime_institutionnelle"
              name="prime_institutionnelle"
              value={formData.prime_institutionnelle}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Sélectionner --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="salaire_base">Salaire de Base <span className="required">*</span></label>
            <select
              id="salaire_base"
              name="salaire_base"
              value={formData.salaire_base}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Sélectionner --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </div>
        </fieldset>

        {/* Section Documents */}
        <fieldset>
          <legend><FaFileAlt /> Documents à Télécharger</legend>

          <div className="form-group">
            <label htmlFor="photo_identite">Photo d'Identité <span className="required">*</span></label>
            <input
              type="file"
              id="photo_identite"
              name="photo_identite"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="possede_diplome">Possède un Diplôme <span className="required">*</span></label>
            <select
              id="possede_diplome"
              name="possede_diplome"
              value={formData.possede_diplome}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Sélectionner --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </div>

          {formData.possede_diplome === 'Oui' && (
            <div className="form-group">
              <label htmlFor="copie_diplome">Copie du Diplôme <span className="required">*</span></label>
              <input
                type="file"
                id="copie_diplome"
                name="copie_diplome"
                accept=".pdf"
                onChange={handleFileChange}
                required={formData.possede_diplome === 'Oui'}
              />
            </div>
          )}

          {formData.possede_diplome === 'Non' && (
            <div className="form-group">
              <label htmlFor="documents_equivalents">Documents Équivalents <span className="required">*</span></label>
              <input
                type="file"
                id="documents_equivalents"
                name="documents_equivalents"
                accept=".pdf"
                onChange={handleFileChange}
                required={formData.possede_diplome === 'Non'}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="copie_these">Copie de la Thèse <span className="required">*</span></label>
            <input
              type="file"
              id="copie_these"
              name="copie_these"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
            />
          </div>
        </fieldset>

        {/* Section Confirmation */}
        <fieldset>
          <legend><FaCheckCircle /> Confirmation</legend>

          <div className="form-group">
            <label htmlFor="commentaire_confirmation">Commentaires <span className="required">*</span></label>
            <textarea
              id="commentaire_confirmation"
              name="commentaire_confirmation"
              value={formData.commentaire_confirmation}
              onChange={handleInputChange}
              rows="3"
              required
            ></textarea>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="informations_vraies"
              name="informations_vraies"
              checked={formData.informations_vraies}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="informations_vraies">
              J'affirme que toutes les informations fournies sont vraies et exactes *
            </label>
          </div>
        </fieldset>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
          >
            {loading ? 'Envoi en cours...' : editMode ? 'Enregistrer les modifications' : 'Enregistrer le Professeur'}
          </button>
          <button
            type="reset"
            className="btn-reset"
            onClick={() => {
              if (editMode) {
                setEditMode(false);
                setChangedFields({});
              }
            }}
          >
            {editMode ? 'Annuler l\'édition' : 'Réinitialiser'}
          </button>
        </div>
      </form>

      {/* Modal pour voir les données */}
      {showViewModal && (
        <div className="modal-overlay" onClick={handleCloseViewModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Consulter vos informations</h2>
              <button 
                type="button" 
                className="btn-close"
                onClick={handleCloseViewModal}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {!viewedData ? (
                <div className="modal-search">
                  <div className="form-group">
                    <label htmlFor="view-matricule">Matricule ESU <span className="required">*</span></label>
                    <input
                      type="text"
                      id="view-matricule"
                      value={viewMatricule}
                      onChange={(e) => setViewMatricule(e.target.value)}
                      placeholder="Ex: 099300"
                      onKeyPress={(e) => e.key === 'Enter' && handleViewData()}
                    />
                  </div>
                  <button 
                    type="button"
                    className="btn-search"
                    onClick={handleViewData}
                    disabled={viewLoading}
                  >
                    {viewLoading ? 'Recherche...' : 'Rechercher'}
                  </button>
                </div>
              ) : (
                <div className="modal-data">
                  <div className="data-section">
                    <h3>Informations Personnelles</h3>
                    <div className="data-row">
                      <span className="data-label">Nom:</span>
                      <span className="data-value">{viewedData.nom}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Postnom:</span>
                      <span className="data-value">{viewedData.postnom}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Prénom:</span>
                      <span className="data-value">{viewedData.prenom}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Sexe:</span>
                      <span className="data-value">{viewedData.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Matricule ESU:</span>
                      <span className="data-value">{viewedData.matricule_esu}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Lieu de naissance:</span>
                      <span className="data-value">{viewedData.lieu_naissance}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Date de naissance:</span>
                      <span className="data-value">{viewedData.date_naissance}</span>
                    </div>
                  </div>

                  <div className="data-section">
                    <h3>Informations Académiques</h3>
                    <div className="data-row">
                      <span className="data-label">Grade actuel:</span>
                      <span className="data-value">{viewedData.grade_actuel}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Université d'attache:</span>
                      <span className="data-value">{viewedData.universite_attache}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Domaine de recherche:</span>
                      <span className="data-value">{viewedData.domaine_recherche}</span>
                    </div>
                  </div>

                  <div className="data-section">
                    <h3>Informations de Soutenance</h3>
                    <div className="data-row">
                      <span className="data-label">Type de diplôme:</span>
                      <span className="data-value">{viewedData.type_diplome}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Université de soutenance:</span>
                      <span className="data-value">{viewedData.universite_soutenance}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Pays de soutenance:</span>
                      <span className="data-value">{viewedData.pays_soutenance}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Date de soutenance:</span>
                      <span className="data-value">{viewedData.date_soutenance}</span>
                    </div>
                  </div>

                  <div className="data-section">
                    <h3>Informations de Contact</h3>
                    <div className="data-row">
                      <span className="data-label">Email:</span>
                      <span className="data-value">{viewedData.email || 'Non renseigné'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Téléphone:</span>
                      <span className="data-value">{viewedData.telephone}</span>
                    </div>
                  </div>

                  <div className="data-section">
                    <h3>Autres Informations</h3>
                    <div className="data-row">
                      <span className="data-label">Prime institutionnelle:</span>
                      <span className="data-value">{viewedData.prime_institutionnelle}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Salaire de base:</span>
                      <span className="data-value">{viewedData.salaire_base}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Sujet de thèse:</span>
                      <span className="data-value">{viewedData.sujet_these || 'Non renseigné'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Référence dernier arrêté:</span>
                      <span className="data-value">{viewedData.reference_dernier_arrete || 'Non renseigné'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Numéro arrêté équivalence:</span>
                      <span className="data-value">{viewedData.numero_arrete_equivalence || 'Non renseigné'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Université d'attache précisée:</span>
                      <span className="data-value">{viewedData.universite_attache_precisee || 'Non renseigné'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Possède un diplôme:</span>
                      <span className="data-value">{viewedData.possede_diplome === 'oui' ? 'Oui' : 'Non'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Commentaire de confirmation:</span>
                      <span className="data-value">{viewedData.commentaire_confirmation || 'Non renseigné'}</span>
                    </div>
                  </div>

                  <div className="data-section">
                    <h3>Documents</h3>
                    <div className="data-row">
                      <span className="data-label">Photo d'identité:</span>
                      <span className="data-value">
                        {viewedData.photo_identite ? (
                          <a href={`${SERVER_URL}${viewedData.photo_identite}`} target="_blank" rel="noopener noreferrer" className="file-link">
                            Voir le fichier
                          </a>
                        ) : (
                          'Non renseigné'
                        )}
                      </span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Copie du diplôme:</span>
                      <span className="data-value">
                        {viewedData.copie_diplome ? (
                          <a href={`${SERVER_URL}${viewedData.copie_diplome}`} target="_blank" rel="noopener noreferrer" className="file-link">
                            Télécharger
                          </a>
                        ) : (
                          'Non renseigné'
                        )}
                      </span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Documents équivalents:</span>
                      <span className="data-value">
                        {viewedData.documents_equivalents ? (
                          <a href={`${SERVER_URL}${viewedData.documents_equivalents}`} target="_blank" rel="noopener noreferrer" className="file-link">
                            Télécharger
                          </a>
                        ) : (
                          'Non renseigné'
                        )}
                      </span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Copie de la thèse:</span>
                      <span className="data-value">
                        {viewedData.copie_these ? (
                          <a href={`${SERVER_URL}${viewedData.copie_these}`} target="_blank" rel="noopener noreferrer" className="file-link">
                            Télécharger
                          </a>
                        ) : (
                          'Non renseigné'
                        )}
                      </span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Copie arrêté équivalence:</span>
                      <span className="data-value">
                        {viewedData.copie_arrete_equivalence ? (
                          <a href={`${SERVER_URL}${viewedData.copie_arrete_equivalence}`} target="_blank" rel="noopener noreferrer" className="file-link">
                            Télécharger
                          </a>
                        ) : (
                          'Non renseigné'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {viewedData && (
                <>
                  <button 
                    type="button"
                    className="btn-danger"
                    onClick={handleConfirmDelete}
                  >
                    Supprimer
                  </button>
                  <button 
                    type="button"
                    className="btn-success"
                    onClick={handleStartEdit}
                  >
                    Modifier
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmer la suppression</h2>
              <button 
                type="button" 
                className="btn-close"
                onClick={handleCancelDelete}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer ce professeur ? Cette action est irréversible.</p>
            </div>
            <div className="modal-footer">
              <button 
                type="button"
                className="btn-secondary"
                onClick={handleCancelDelete}
              >
                Annuler
              </button>
              <button 
                type="button"
                className="btn-danger"
                onClick={handleDeleteProfessor}
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      <LoadingModal 
        isVisible={loading} 
        message="Enregistrement en cours"
      />
    </div>
  );
};

export default ProfessorRegistrationForm;
