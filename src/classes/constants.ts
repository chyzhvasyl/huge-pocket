export const Constants = {
    roles: {
        admin: 'CN=NEWS_Administrator',
        author: 'CN=NEWS_Author',
        editor: 'CN=NEWS_Editor',
        publisher: 'CN=NEWS_publisher',
        reader: 'CN=NEWS_Reader'
    },
    article_status: {
        created: 'created',
        modified: 'modified',
        published: 'published',
        not_approved_by_editor: 'not approved by editor',
        not_approved_by_publisher: 'not approved by publisher'
    },
    MAX_CACHE_AGE: 300000,
    toastMessageOptions: {
        showCloseButton: true,
        position: 'bottom',
        closeButtonText: 'х',
        duration: 2000
    },
    toastMessageText:{
        addingArticle:{
            message: 'Статья добавлена'
        },
        deletingArticle:{
            message: 'Статья удалена'
        },
        editingArticle:{
            message: 'Статья изменена'
        },
        absenceReport:{
            message: 'Отчёта не найдено'
        }
    }
};