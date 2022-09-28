import { QuizStatus } from '@/components/quiz/types';
import { firestore } from '@helpers/firebase';

/**
 * Given a user's survey adds a passed earned points.
 * @param surveyId The current survey ID.
 * @param userId The current user ID.
 * @param nextPoints The acumulative points.
 */
export async function saveAcumulativePoints(
  surveyId: string,
  userId: string,
  nextPoints: number,
) {
  // Get last points
  const firebaseRef = firestore
    .collection('votingStatusByUser')
    .doc(userId)
    .collection('surveyStatus')
    .doc(surveyId);
    
  const result = await firebaseRef.get();

  // Create the payload
  let acumulativePoints = 0;

  // Check if there is saved points
  if (result.exists) {
    const {
      right = 0,
    } = result.data() as QuizStatus;
    acumulativePoints = acumulativePoints + right;
    // Add points
  }
  // Speak pretty goodly with Firestore
  await firebaseRef.set({ right: acumulativePoints + nextPoints } as QuizStatus, {merge: true});
  console.debug(`save survey status /votingStatusByUser/${userId}/surveyStatus/${surveyId}`, 'value', acumulativePoints, '->', acumulativePoints + nextPoints);
}