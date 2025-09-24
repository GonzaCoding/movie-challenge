import { useParams } from 'react-router-dom';

function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <main>
      <h1>Movie Detail</h1>
      <p>Movie ID: {id}</p>
    </main>
  );
}

export default MovieDetailPage;
