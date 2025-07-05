import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Container,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const faqs = [
  {
    question: 'How does BookRental work?',
    answer:
      'Book owners upload their books. Readers nearby can browse, rent, and return books after use. Owners earn money from each rental.',
  },
  {
    question: 'Who can upload books?',
    answer:
      'Anyone who registers as a book owner can upload and manage their book listings after approval by an admin.',
  },
  {
    question: 'Is it free to use?',
    answer:
      'Browsing and signing up is free. Rental prices are set by the book owners, and a small service fee may apply.',
  },
  {
    question: 'How do I get paid as a book owner?',
    answer:
      'Once your books are rented, your wallet balance updates automatically. You can withdraw your earnings anytime.',
  },
  {
    question: 'What if a book is lost or damaged?',
    answer:
      'We encourage communication between owners and renters. In case of issues, our support team will mediate the process.',
  },
]

export default function FAQSection() {
  return (
    <Box sx={{ py: 10, backgroundColor: '#ffffff' }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Frequently Asked Questions
        </Typography>

        {faqs.map((faq, index) => (
          <Accordion key={index} sx={{ my: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="medium">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  )
}
