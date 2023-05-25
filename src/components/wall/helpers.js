import { firestore, fireStorage } from '@helpers/firebase'
import { StateMessage } from '@context/MessageService'

export const saveFirebase = {
  async savePost(data, eventId) {
    try {
      if (data.urlImage) {
        const storageRef = fireStorage.ref()
        const imageName = Date.now()
        const imageRef = storageRef.child('images/' + imageName + '.png')
        const snapshot = await imageRef.putString(data.urlImage, 'data_url')
        const imageUrl = await snapshot.ref.getDownloadURL()

        data.urlImage = imageUrl
      }

      const docRef = await firestore
        .collection('adminPost')
        .doc(`${eventId}`)
        .collection('posts')
        .add(data)

      const postSnapShot = await docRef.get()
      const post = postSnapShot.data()
      post.id = postSnapShot.id

      return post
    } catch (e) {
      console.error(e)
      StateMessage.show(
        null,
        'warning',
        'Los datos necesarios no se han registrado, por favor intenta de nuevo',
      )
    }
  },

  async increaseLikes(postId, eventId, userId) {
    const docRef = firestore
      .collection('adminPost')
      .doc(eventId)
      .collection('posts')
      .doc(postId)

    const docSnap = await docRef.get()
    const doc = docSnap.data()

    const count = doc['usersLikes'].length //cuenta la cantidad de usuarios que han dado like
    const array = doc['usersLikes'] //asigna a un array los uauruarios que han dado like

    // si el usuario actual no se encuntra en el array, lo guarda y suma al contador de like
    if (array.filter((user) => user == userId).length == 0) {
      array.push(userId)

      doc['usersLikes'] = array
      doc['likes'] = count + 1
      doc['id'] = docRef.id
      await docRef.update(doc)
    }
    // si el usuario actual se encuentra en el array lo elimina y reduce el contador de like
    else {
      const newArray = array.filter((user) => user !== userId)

      doc['usersLikes'] = newArray
      doc['likes'] = count - 1
      doc['id'] = docRef.id
      await docRef.update(doc)
    }

    return doc
  },

  async createComment(postId, eventId, comment, user) {
    console.log('USER COMMENTARIO==>', user)
    const docRef = await firestore
      .collection('adminPost')
      .doc(eventId)
      .collection('posts')
      .doc(postId)
    const docSnap = await docRef.get()
    const doc = docSnap.data()

    doc['comments'] = doc.comments ? doc.comments + 1 : 1
    doc['id'] = docRef.id
    await docRef.update(doc)
    // const posts = await firestore
    //   .collection('adminPost')
    //   .doc(eventId)
    //   .collection('posts')
    //   .orderBy('datePost', 'desc')
    //GUARDAR COMENTARIO
    // const admincommentsRef = firestore
    //   .collection('adminPost')
    //   .doc(eventId)
    //   .collection('comment')
    //   .doc(postId)
    //   .collection('comments')
    //   .add({
    //     author: user._id,
    //     authorName: user.names || user.email,
    //     comment: comment,
    //     date: new Date(),
    //     idPost: postId,
    //     picture: user.picture || '',
    //   })
  },

  async deletePost(postId, eventId) {
    try {
      await firestore
        .collection('adminPost')
        .doc(eventId)
        .collection('posts')
        .doc(postId)
        .delete()

      const query = firestore
        .collection('adminPost')
        .doc(eventId)
        .collection('comment')
        .doc(postId)
        .collection('comments')

      const queryPostId = firestore
        .collection('adminPost')
        .doc(eventId)
        .collection('comment')
        .doc(postId)

      const querySnapshot = await query.get()
      if (querySnapshot) {
        querySnapshot.forEach(async function (doc) {
          await doc.ref.delete()
        })
        queryPostId.delete()
      }
      return true
    } catch (e) {
      console.error(e)
      StateMessage.show(
        null,
        'warning',
        'La información aun no ha sido eliminada, por favor intenta de nuevo',
      )
    }

    return true
  },
}
