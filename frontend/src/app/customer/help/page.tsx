'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Grid,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  LocalLaundryService as LaundryIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  ContactSupport as SupportIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  LiveHelp as LiveHelpIcon
} from '@mui/icons-material';

// FAQ data
const faqCategories = [
  {
    id: 'general',
    name: 'Umum',
    icon: <InfoIcon color="primary" />,
    faqs: [
      {
        question: 'Apa itu Laundry App?',
        answer: 'Laundry App adalah aplikasi yang memudahkan Anda untuk memesan layanan laundry secara online. Kami menawarkan berbagai layanan termasuk cuci regular, dry cleaning, dan setrika dengan sistem penjemputan dan pengantaran.'
      },
      {
        question: 'Bagaimana cara membuat akun di Laundry App?',
        answer: 'Untuk membuat akun, Anda dapat mengklik tombol "Daftar" di halaman masuk aplikasi. Isi data diri Anda seperti nama, email, nomor telepon, dan kata sandi. Verifikasi akun Anda melalui email atau nomor telepon untuk mulai menggunakan layanan kami.'
      },
      {
        question: 'Apakah Laundry App tersedia 24 jam?',
        answer: 'Ya, Anda dapat memesan layanan melalui aplikasi kami 24 jam sehari, 7 hari seminggu. Namun, layanan operasional kami tersedia dari pukul 08.00 hingga 21.00 setiap hari.'
      }
    ]
  },
  {
    id: 'orders',
    name: 'Pesanan',
    icon: <LaundryIcon color="primary" />,
    faqs: [
      {
        question: 'Bagaimana cara memesan layanan laundry?',
        answer: 'Untuk memesan layanan, masuk ke akun Anda dan pilih "Pesan Baru" dari dashboard. Pilih jenis layanan, tentukan jumlah item, dan pilih waktu penjemputan. Isi alamat Anda dan metode pembayaran, kemudian konfirmasi pesanan Anda.'
      },
      {
        question: 'Apakah saya bisa mengubah atau membatalkan pesanan?',
        answer: 'Ya, Anda dapat mengubah atau membatalkan pesanan selama status pesanan masih "Menunggu Konfirmasi". Setelah pesanan dikonfirmasi dan diproses, Anda perlu menghubungi layanan pelanggan untuk membantu perubahan atau pembatalan.'
      },
      {
        question: 'Berapa lama waktu yang dibutuhkan untuk menyelesaikan laundry?',
        answer: 'Waktu penyelesaian laundry bervariasi tergantung jenis layanan. Layanan regular biasanya selesai dalam 2-3 hari kerja, sementara layanan express dapat selesai dalam 24 jam. Anda dapat memantau status pesanan Anda melalui aplikasi.'
      }
    ]
  },
  {
    id: 'delivery',
    name: 'Pengiriman',
    icon: <ShippingIcon color="primary" />,
    faqs: [
      {
        question: 'Apakah Laundry App menyediakan layanan antar-jemput?',
        answer: 'Ya, kami menyediakan layanan antar-jemput untuk memudahkan Anda. Biaya antar-jemput bervariasi tergantung lokasi Anda dan akan ditampilkan pada saat checkout.'
      },
      {
        question: 'Kapan waktu penjemputan dan pengantaran?',
        answer: 'Anda dapat memilih waktu penjemputan dan pengantaran sesuai dengan jadwal yang tersedia di aplikasi. Kami memiliki slot waktu dari pukul 08.00 sampai 21.00 setiap hari.'
      },
      {
        question: 'Bagaimana jika saya tidak ada di rumah saat pengantaran?',
        answer: 'Jika Anda tidak dapat menerima laundry pada waktu yang telah dijadwalkan, Anda dapat menghubungi kami untuk menjadwalkan ulang pengantaran tanpa biaya tambahan. Anda juga dapat meminta agar laundry ditinggalkan pada tetangga atau satpam dengan instruksi khusus.'
      }
    ]
  },
  {
    id: 'payment',
    name: 'Pembayaran',
    icon: <PaymentIcon color="primary" />,
    faqs: [
      {
        question: 'Metode pembayaran apa saja yang tersedia?',
        answer: 'Kami menerima berbagai metode pembayaran termasuk kartu kredit/debit, transfer bank, e-wallet (GoPay, OVO, DANA), dan pembayaran tunai saat pengantaran.'
      },
      {
        question: 'Apakah ada biaya tambahan untuk layanan tertentu?',
        answer: 'Beberapa layanan khusus seperti pembersihan noda membandel, dry cleaning, atau penanganan pakaian spesial mungkin dikenakan biaya tambahan. Biaya ini akan ditampilkan dengan jelas saat Anda memesan.'
      },
      {
        question: 'Bagaimana cara mendapatkan invoice atau bukti pembayaran?',
        answer: 'Invoice atau bukti pembayaran akan otomatis dikirimkan ke email Anda setelah pesanan selesai. Anda juga dapat melihat dan mengunduh invoice dari halaman detail pesanan di aplikasi.'
      }
    ]
  },
  {
    id: 'schedule',
    name: 'Jadwal',
    icon: <ScheduleIcon color="primary" />,
    faqs: [
      {
        question: 'Bagaimana cara menjadwalkan penjemputan laundry?',
        answer: 'Untuk menjadwalkan penjemputan, buka halaman "Jadwal" dari menu navigasi, pilih tanggal dan waktu yang tersedia, masukkan alamat Anda, dan konfirmasi jadwal. Anda akan menerima notifikasi saat kurir dalam perjalanan.'
      },
      {
        question: 'Bisakah saya mengubah jadwal penjemputan?',
        answer: 'Ya, Anda dapat mengubah jadwal penjemputan selama 2 jam sebelum waktu yang dijadwalkan. Masuk ke halaman detail jadwal dan pilih opsi "Ubah Jadwal".'
      },
      {
        question: 'Apakah layanan antar-jemput tersedia di semua wilayah?',
        answer: 'Layanan antar-jemput tersedia di sebagian besar wilayah Jakarta, Tangerang, Bekasi, dan Depok. Anda dapat memeriksa apakah lokasi Anda terjangkau dengan memasukkan alamat Anda pada aplikasi.'
      }
    ]
  }
];

// Contact methods
const contactMethods = [
  {
    icon: <PhoneIcon fontSize="large" />,
    title: 'Telepon',
    description: 'Hubungi kami di nomor:',
    contact: '021-123-4567',
    available: 'Senin-Sabtu, 08:00-20:00'
  },
  {
    icon: <WhatsAppIcon fontSize="large" />,
    title: 'WhatsApp',
    description: 'Kirim pesan WhatsApp ke:',
    contact: '0812-3456-7890',
    available: '24 jam, 7 hari seminggu'
  },
  {
    icon: <EmailIcon fontSize="large" />,
    title: 'Email',
    description: 'Kirim email ke:',
    contact: 'help@laundryapp.com',
    available: 'Respon dalam 24 jam'
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setHasSearched(true);
    
    // Simulate search delay
    setTimeout(() => {
      const results: any[] = [];
      
      faqCategories.forEach(category => {
        const matchingFaqs = category.faqs.filter(faq => 
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (matchingFaqs.length > 0) {
          results.push({
            category: category.name,
            icon: category.icon,
            faqs: matchingFaqs
          });
        }
      });
      
      setFilteredFaqs(results);
      setSearching(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setHasSearched(false);
    setSearchQuery('');
    setFilteredFaqs([]);
  };
  
  const renderFaqs = () => {
    if (hasSearched) {
      if (searching) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress size={40} />
          </Box>
        );
      }
      
      if (filteredFaqs.length === 0) {
        return (
          <Alert 
            severity="info" 
            sx={{ mt: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => setHasSearched(false)}>
                Lihat Semua FAQ
              </Button>
            }
          >
            Tidak ditemukan FAQ yang sesuai dengan "{searchQuery}". Coba kata kunci lain atau jelajahi FAQ berdasarkan kategori.
          </Alert>
        );
      }
      
      return filteredFaqs.map((result, index) => (
        <Box key={index} mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            {result.icon}
            <Typography variant="h6" ml={1}>
              {result.category}
            </Typography>
          </Box>
          
          {result.faqs.map((faq: any, faqIndex: number) => (
            <Accordion key={faqIndex} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={500}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ));
    }
    
    // Show faqs by category
    if (activeCategory === 'all') {
      return faqCategories.map((category, index) => (
        <Box key={category.id} mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            {category.icon}
            <Typography variant="h6" ml={1}>
              {category.name}
            </Typography>
          </Box>
          
          {category.faqs.map((faq, faqIndex) => (
            <Accordion key={faqIndex} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={500}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ));
    } else {
      const selectedCategory = faqCategories.find(cat => cat.id === activeCategory);
      if (!selectedCategory) return null;
      
      return (
        <Box mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            {selectedCategory.icon}
            <Typography variant="h6" ml={1}>
              {selectedCategory.name}
            </Typography>
          </Box>
          
          {selectedCategory.faqs.map((faq, faqIndex) => (
            <Accordion key={faqIndex} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={500}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      );
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pusat Bantuan
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Temukan jawaban untuk pertanyaan umum atau hubungi kami untuk bantuan lebih lanjut
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            placeholder="Cari pertanyaan atau bantuan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={!searchQuery.trim() || searching}
            sx={{ minWidth: '120px', height: '56px' }}
          >
            {searching ? <CircularProgress size={24} /> : 'Cari'}
          </Button>
        </Box>
      </Paper>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Kategori
            </Typography>
            
            <List component="nav" disablePadding>
              <Box 
                onClick={() => handleCategoryChange('all')}
                sx={{ 
                  borderRadius: 1, 
                  mb: 1, 
                  cursor: 'pointer',
                  bgcolor: activeCategory === 'all' ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LiveHelpIcon color={activeCategory === 'all' ? 'primary' : 'action'} />
                  </ListItemIcon>
                  <ListItemText primary="Semua FAQ" />
                </ListItem>
              </Box>
              
              {faqCategories.map((category) => (
                <Box 
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  sx={{ 
                    borderRadius: 1, 
                    mb: 1, 
                    cursor: 'pointer',
                    bgcolor: activeCategory === category.id ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {React.cloneElement(category.icon, { 
                        color: activeCategory === category.id ? 'primary' : 'action'
                      })}
                    </ListItemIcon>
                    <ListItemText primary={category.name} />
                    <Chip 
                      label={category.faqs.length} 
                      size="small" 
                      variant={activeCategory === category.id ? "filled" : "outlined"}
                      color={activeCategory === category.id ? "primary" : "default"}
                      sx={{ ml: 1 }}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Masih Butuh Bantuan?
            </Typography>
            
            <Button
              variant="outlined"
              fullWidth
              startIcon={<SupportIcon />}
              href="#contact-section"
              sx={{ mt: 1 }}
            >
              Hubungi Kami
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          {/* FAQ content */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Pertanyaan yang Sering Diajukan
            </Typography>
            
            <Box mt={3}>
              {renderFaqs()}
            </Box>
          </Paper>
          
          {/* Contact section */}
          <Box id="contact-section">
            <Typography variant="h5" gutterBottom>
              Hubungi Kami
            </Typography>
            
            <Typography variant="body1" color="textSecondary" paragraph>
              Jika Anda tidak menemukan jawaban yang Anda cari, tim layanan pelanggan kami siap membantu Anda.
            </Typography>
            
            <Grid container spacing={3} mt={1}>
              {contactMethods.map((method, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: '100%', borderRadius: 2 }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Box color="primary.main" mb={2}>
                        {method.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {method.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {method.description}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {method.contact}
                      </Typography>
                      <Chip 
                        label={method.available} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
} 