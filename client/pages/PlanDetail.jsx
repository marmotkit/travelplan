import { Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';

export default function PlanDetail() {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        行程詳情
      </Typography>
      <Typography variant="body1">
        行程 ID: {id}
      </Typography>
    </Box>
  );
} 