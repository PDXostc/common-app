#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <stdbool.h>
#include <dirent.h>
#include <errno.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <glib.h>
#include <glib/gstdio.h>

#include "fprint.h"
#include "fp_internal.h"
#include "fp_if.h"

#define printf //

static struct fp_dev *dev;
static uint16_t storage_driver_id = -1;
static uint32_t storage_devtype = -1;
static fp_usr_record usr_record[MAX_USERS];
static int usr_idx = -1;

static int delete_finger(char *user, enum gender gen, enum fp_finger finger_id);
static int delete_individual_user(char *user, enum gender gen);
static int delete_all_records();
static int modify_user_record(char *user, enum gender gen, enum fp_finger f_id, enum action_id action);
static int locate_user_record(char *user, enum gender gen);
static int add_user_record(char *user, enum gender gen, enum fp_finger f_id);

int libfprint_init(void);
fp_usr_record *libfprint_fetch_user_data();
void libfprint_deinit();
int delete_user_record(char *user, enum gender gen, enum fp_finger f_id, enum del_category cat);
int verify_finger(verified_user *usr);
int enroll_finger(char *user, enum gender gen, enum fp_finger finger_id);
int flag = 0;

#define mss
/* For discovery of device
 */
static struct fp_dscv_dev *discover_device(struct fp_dscv_dev **discovered_devs) {
    struct fp_dscv_dev *ddev = discovered_devs[0];
    struct fp_driver *drv;
    if (!ddev) return NULL;

    drv = fp_dscv_dev_get_driver(ddev);
    fprintf(stderr, "LIBFPIF - found device claimed by %s driver\n", fp_driver_get_full_name(drv));
    return ddev;
}

fp_usr_record *libfprint_fetch_user_data() {
    return usr_record;
}

int libfprint_init(void)
{
    fprintf(stderr, "LIBFPIF - entering init\n");

    int r = -1;
    struct fp_dscv_dev **discovered_devs;
    struct fp_dscv_dev *ddev;
	/* for checking if the database directory exists
	 */
    DIR *dirp;
    char buff[100] = { 0 };
    int i = 0;
    char num[100];
    char customer[10];
    int tmp_idx = 0;
    int gen[10],f1[10],f2[10],f3[10],f4[10],f5[10],f6[10],f7[10],f8[10],f9[10],f10[10];
    FILE *file = fopen("/home/app/data/fp_data/tmp.csv", "r");

    if(file == NULL)
    {
        fprintf(stderr, "LIBFPIF - can't open input file in.list!\n");
    }
    r = fp_init();

    if (r < 0)
    {
        fprintf(stderr, "LIBIFIP - error from fp_init: %d\n", r);
        r = LIBFP_INIT_FAILURE;
        return r;
    }
    fp_set_debug(3);

    discovered_devs = fp_discover_devs();
    if (!discovered_devs) {
        fprintf(stderr, "LIBIFIP - error from fp_discover_devs\n");
        r = LIBFP_FP_DEVICE_NOT_FOUND;
        return r;
    }

    ddev = discover_device(discovered_devs);
    if (!ddev) {
        fprintf(stderr, "LIBIFIP - error from discover_device\n");
        r = LIBFP_FP_DEVICE_NOT_FOUND;
        return r;
    }

    dev = (struct fp_dev *) malloc(sizeof(struct fp_dev));
    if (NULL == dev) {
        r = LIBFP_MEMORY_ERROR;
        return r;
    }

    dev = fp_dev_open(ddev);
    fp_dscv_devs_free(discovered_devs);
    if (!dev) {
        fprintf(stderr, "LIBIFIP - error from fp_dev_open\n");
        r = LIBFP_FP_DEVICE_OPEN_FAILED;
        return r;
    }

	/* Below two parameters are needed to identify storage location
	 */
    storage_driver_id = dev->drv->id;
    storage_devtype = dev->devtype;

	/* Must reset all the user data structure before filling it up
	 */
    memset(usr_record, 0, sizeof(usr_record));

	/* Check if the database folder exists. If not, create the same.
	 */
    dirp = opendir(DEFAULT_DB_PATH);
    if (NULL == dirp) {
        sprintf(buff, "mkdir -v -p %s", DEFAULT_DB_PATH);
        system(buff);

            /* The DEFAULT_DB_PATH has ending / by default
             * Do not add again. Causes problems
             */
        memset(buff, 0, sizeof(buff));
        sprintf(buff, "%s%s", DEFAULT_DB_PATH, USER_DB_FILE);
        r = open(buff, O_CREAT | O_RDWR);
        if (r < 0) {
        } else {
                /* We do not want to keep the file open forever. It might create some issues
                 */
            close(r);
        }
    } else {
            /* Now we need to scan the root folder to identify total number of users
             */
    }

    if ((-1 != storage_driver_id) && (-1 != storage_devtype))

    {
            //fprintf(stderr, "LIBFPIF: Storage location not known. Cannot move ahead\n");
    }

    if(file == NULL)
    {
        fprintf(stderr, "LIBFPIF - can't open input file in.list!\n");

    }
    else
    {
        while (fgets (num, 50,file) > 0)
        {
            sscanf(num,"%s %d %d %d %d %d %d %d %d %d %d %d \n",customer,&gen[i],&f1[i],&f2[i],&f3[i],&f4[i],&f5[i],&f6[i],&f7[i],&f8[i],&f9[i],&f10[i]);

            strncpy(usr_record[tmp_idx].user, customer, strlen(customer));
            usr_record[tmp_idx].gen = gen[i];
            usr_record[tmp_idx].fp_lt = f1[i];
            usr_record[tmp_idx].fp_li = f2[i];
            usr_record[tmp_idx].fp_lm = f3[i];
            usr_record[tmp_idx].fp_lr = f4[i];
            usr_record[tmp_idx].fp_ll = f5[i];
            usr_record[tmp_idx].fp_rt = f6[i];
            usr_record[tmp_idx].fp_ri = f7[i];
            usr_record[tmp_idx].fp_rm = f8[i];
            usr_record[tmp_idx].fp_rr = f9[i];
            usr_record[tmp_idx].fp_rl = f10[i];
            tmp_idx++;
        }
        fclose(file);
    }

    return r;
}

/* All the functions inside this function are voidarray[1]
 * hence we also must return void
 */
void libfprint_deinit() {
    if (NULL != dev) {
        fp_dev_close(dev);
    }

    fp_exit();
}

/* The idea is to always store the enrolled finger to _default_ location.
 * Post this installation, only if user asks, we will store the image
 * to a certain location
 */
struct fp_print_data *enroll_finger_img() {
    struct fp_print_data *enrolled_print = NULL;
    int r;
	////fprintf (stderr, "LIBFPIF: Inside __FUNCTION__ = %s\n", __func__);

    struct fp_img *img = NULL;

    r = fp_enroll_finger_img(dev, &enrolled_print, &img);
    if (img) {
        fp_img_free(img);
    }
    if (r < 0) {
            ////fprintf(stderr, "LIBFPIF: Enroll failed with error %d\n", r);
        return NULL;
    }

    switch (r) {
	case FP_ENROLL_COMPLETE:
            fprintf(stderr, "LIBFPIF: Enroll Complete!\n");
            break;
	case FP_ENROLL_FAIL:
            fprintf(stderr, "LIBFPIF: Enroll failed, something wen't wrong :(\n");
            return NULL;
	case FP_ENROLL_PASS:
            fprintf(stderr, "LIBFPIF: Enroll stage passed. Yay!\n");
            break;
	case FP_ENROLL_RETRY:
            fprintf(stderr, "LIBFPIF: Didn't quite catch that. Please try again.\n");
            break;
	case FP_ENROLL_RETRY_TOO_SHORT:
            fprintf(stderr, "LIBFPIF: Your swipe was too short, please try again.\n");
            break;
	case FP_ENROLL_RETRY_CENTER_FINGER:
            fprintf(stderr, "LIBFPIF: Didn't catch that, please centre your finger on the sensor and try again.\n");
            break;
	case FP_ENROLL_RETRY_REMOVE_FINGER:
            fprintf(stderr, "LIBFPIF: Scan failed, please remove your finger and then try again.\n");
            break;
    }

    if (!enrolled_print) {
        fprintf(stderr, "LIBFPIF: Enroll complete but no print?\n");
        return NULL;
    }

    fprintf(stderr, "LIBFPIF: Enrollment completed!\n\n");
    return enrolled_print;
}

int file_operation(char *user, enum gender gen, enum fp_finger f_id, enum action_id action) {
    char filename[50] = { 0 };
    char sys_buff[100] = { 0 };
    char storage_loc[50] = { 0 };
    int r = -1;
    enum fp_finger f_id_local = 0;

    if (MAX_NAME_LENGTH <= strlen(user)) {
        fprintf(stderr, "LIBFPIF: Username too big. Max 8 characters \n");
        return -1;
    }

    f_id_local = f_id % 10;
    if (f_id_local == 0) {
        f_id_local = 10;
    }

    sprintf(filename, "%s%s_%s_%d", DEFAULT_DB_PATH, user, gen ? "MALE" : "FEMALE", (f_id_local));
    if ((-1 != storage_driver_id) && (-1 != storage_devtype))
        sprintf(storage_loc, "~/.fprint/prints/%04d/%08d/%x", storage_driver_id, storage_devtype, f_id);
    else {
        fprintf(stderr, "LIBFPIF: Storage location not known. Cannot move ahead\n");
    }

    if (EN_FP_RECORD == action) {
        sprintf(sys_buff, "cp -v %s %s", storage_loc, filename);
    } else if (EN_FP_DELETE == action) {
        sprintf(sys_buff, "rm -v %s", filename);
        fprintf(stderr, "\nLIBFPIF: %s \n", filename);
    } else if (EN_FP_VERIFY == action) {
        sprintf(sys_buff, "ls -al %s", filename);
        r = system(sys_buff);
        if (r == 0) {
            sprintf(sys_buff, "cp -v %s %s", filename, storage_loc);
            fprintf(stderr, "\nLIBFPIF: %s \n", filename);
        }
    } else {
        fprintf(stderr, "LIBFPIF: Unspecified action\n");
    }

    fprintf(stderr, "LIBFPIF: sys_buff is %s\n", sys_buff);

    r = system(sys_buff);
    if (r < 0) {
        fprintf(stderr, "LIBFPIF: System command failed!!!\n");
    }
    return r;
}

static struct fp_print_data **find_dev_and_prints(struct fp_dscv_print **prints, enum fp_finger **fingers) {
    int i = 0, j = 0, err;
    struct fp_dscv_print *print;
    size_t prints_count = 0;
    struct fp_print_data **gallery;

    while ((print = prints[i++])) {

        prints_count++;
    }
    fprintf(stderr, "LIBFPIF: prints_count = %d\n", prints_count);

    if (prints_count == 0) {
        fprintf(stderr, "LIBFPIF: ERROR: Failed to get prints count\n");
        return NULL;
    }

    gallery = malloc(sizeof(*gallery) * (prints_count + 1));
    if (gallery == NULL) {
        return NULL;
    }
    gallery[prints_count] = NULL;
    *fingers = malloc(sizeof(*fingers) * (prints_count));
    if (*fingers == NULL) {
        free(gallery);
        return NULL;
    }

    i = 0, j = 0;
    while ((print = prints[i++])) {
        err = fp_print_data_from_dscv_print(print, &(gallery[j]));
        if (err != 0) {
            gallery[j] = NULL;
            break;
        }
        (*fingers)[j] = fp_dscv_print_get_finger(print);
        j++;
    }
    return gallery;
}

static int do_identify(struct fp_print_data **gallery, size_t offset) {
    int r;

    fprintf(stderr, "LIBFPIF: Inside __FUNCTION__ = %s\n", __func__);

    r = fp_identify_finger(dev, gallery, &offset);

    fprintf(stderr, "\nLIBFPIF:  r=%d, offset=%d\n", r, offset);
    flag = offset;
    switch (r) {
	case FP_VERIFY_NO_MATCH:
            fprintf(stderr, "\nLIBFPIF:  No Match, Try again.\n");
            break;
	case FP_VERIFY_MATCH:
            fprintf(stderr, "\nLIBFPIF:  Match.\n");
            break;
	case FP_VERIFY_RETRY:
            fprintf(stderr, "LIBFPIF: Scan didn't quite work. Please try again.\n");
            break;
	case FP_VERIFY_RETRY_TOO_SHORT:
            fprintf(stderr, "LIBFPIF: Swipe was too short, please try again.\n");
            break;
	case FP_VERIFY_RETRY_CENTER_FINGER:
            fprintf(stderr, "LIBFPIF: Please center your finger on the sensor and try again.\n");
            break;
	case FP_VERIFY_RETRY_REMOVE_FINGER:
            fprintf(stderr, "LIBFPIF: Please remove finger from the sensor and try again.\n");
            break;
	default:
            fprintf(stderr, "LIBFPIF: Errorcode for verification unknown\n");
    }
    return r;
}

int verify_finger(verified_user *usr) {
    struct fp_dscv_print **prints;
    struct fp_print_data **gallery;
    enum fp_finger *fingers;
    int r = -1;
    int tmp_idx = -1;
    enum fp_finger loop = LEFT_THUMB;
    int i = 0;
    int j = 0;
    int offset = 0;
    char storage_loc[50] = { 0 };
    char sys_buff[100] = { 0 };
    int no_of_fingers = 0;
	/* 1. Depending upon number of available users copy contents to
	 * predefined folder
	 * 2. Then try to identify the match
	 * 3. If match is found, exit with user identification
	 * 4. Else, continue trying to look till all users are exhausted
	 */
    if ((-1 != storage_driver_id) && (-1 != storage_devtype))
        sprintf(storage_loc, "~/.fprint/prints/%04d/%08d/*", storage_driver_id, storage_devtype);
    else {
        fprintf(stderr, "LIBFPIF: Storage location not known. Cannot move ahead\n");
    }

    sprintf(sys_buff, "rm -v %s", storage_loc);
    system(sys_buff);
    sprintf(storage_loc, "/home/app/data/fp_data/validate_user.csv");
    sprintf(sys_buff, "rm -v %s", storage_loc);
    system(sys_buff);

    fprintf(stderr, "LIBFPIF: Inside __FUNCTION__ = %s\n", __func__);
    tmp_idx = 0;
    do {
        if (0 != strcmp(usr_record[tmp_idx].user, "\0")) {
            i++;
            for (loop = LEFT_THUMB; loop <= RIGHT_LITTLE; loop++) {
                    /* It might happen that some of the records do not exist,
                     * However, we are not placing all those checks right now
                     * We will place them later.
                     */
                j++;
                switch (loop) {

                    case LEFT_THUMB:
                        if (usr_record[tmp_idx].fp_lt == 1) {
                            r = 0;
                        }
                        break;
                    case LEFT_INDEX:
                        if (usr_record[tmp_idx].fp_li == 1) {
                            r = 0;
                        }
                        break;
                    case LEFT_MIDDLE:
                        if (usr_record[tmp_idx].fp_lm == 1) {
                            r = 0;
                        }
                        break;
                    case LEFT_RING:
                        if (usr_record[tmp_idx].fp_lr == 1) {
                            r = 0;
                        }
                        break;
                    case LEFT_LITTLE:
                        if (usr_record[tmp_idx].fp_ll == 1) {
                            r = 0;
                        }
                        break;
                    case RIGHT_THUMB:
                        if (usr_record[tmp_idx].fp_rt == 1) {
                            r = 0;
                        }
                        break;
                    case RIGHT_INDEX:
                        if (usr_record[tmp_idx].fp_ri == 1) {
                            r = 0;
                        }
                        break;
                    case RIGHT_MIDDLE:
                        if (usr_record[tmp_idx].fp_rm == 1) {
                            r = 0;
                        }
                        break;
                    case RIGHT_RING:
                        if (usr_record[tmp_idx].fp_rr == 1) {
                            r = 0;
                        }
                        break;
                    case RIGHT_LITTLE:
                        if (usr_record[tmp_idx].fp_rl == 1) {
                            r = 0;
                        }
                        break;
                }
                if (r == 0) {
                    file_operation(usr_record[tmp_idx].user, usr_record[tmp_idx].gen, (loop + (tmp_idx * 10)), EN_FP_VERIFY);
                    r = -1;
                    no_of_fingers++;
                }
            }

#ifdef mss
        }
    }
    while ((tmp_idx++ < MAX_USERS));
#endif
    if (no_of_fingers > 0) {
        prints = fp_discover_prints();
        if (!prints) {
            fprintf(stderr, "LIBFPIF: Could not find prints in root directory\n");
            return LIBFP_DISCOVER_PRINTS_FAILED;
        }

        gallery = find_dev_and_prints(prints, &fingers);
        if (!gallery) {
            fp_dscv_prints_free(prints);
            fprintf(stderr, "LIBFPIF: Could not locate any suitable fingerprints matched with available hardware.");
            return LIBFP_DISCOVER_PRINTS_FAILED;
        }

            /* The work for prints is done now, so we can release them
             */
        fp_dscv_prints_free(prints);
        r = do_identify(gallery, offset);
        fprintf(stderr, "Done with identify just now, return = %d\n", r);
    }
    if (FP_VERIFY_MATCH == r) {

//logic for getting data from file and storing in array
        FILE *file = fopen("/home/app/data/fp_data/validate_user.csv", "r");
        static int integers[100];
        int len = 0;
        int i = 0;
        int num;
        while (fscanf(file, "%d", &num) > 0) {
            integers[i] = num;
            i++;
            len++;
        }
        fclose(file);
        int t, c;
        int end = len - 1;
        for (c = 0; c < len / 2; c++) {
            t = integers[c];
            integers[c] = integers[end];
            integers[end] = t;
            end--;
        }
//logic finish

        fprintf(stderr, "LIBFPIF: !!!! MATCH !!!!\n");
        tmp_idx = integers[flag] / 10;
        if (integers[flag] % 10 == 0) tmp_idx = tmp_idx - 1;
        fprintf(stderr, "LIBFPIF: %d \t%d\n", integers[flag], tmp_idx);
        if (tmp_idx >= 0) {
            strncpy(usr->user, usr_record[tmp_idx].user, strlen(usr_record[tmp_idx].user));
            usr->gen = usr_record[tmp_idx].gen;
            fprintf(stderr, "LIBFPIF: \n Verified User = %s, Gen = %d tmp_idx = %d\n", usr->user, usr->gen, tmp_idx);
        }
#ifndef mss
        break;
#endif
    } else {
            /* ALERT! ALERT!! ALERT!!
             * Actual error codes are different and positive.
             * However, we _SHOULD_ not send any positive error codes to GUI
             * 0/1 = SUCCESS and -1 = ERROR
             * Hence, below is modified
             */
        r = 0;
        fprintf(stderr, "LIBFPIF: xxxxx NO MATCH xxxxx\n");
        memset(usr->user, 0, MAX_NAME_LENGTH);
        usr->gen = NOT_SPECIFIED;
    }
#ifndef mss
}
else
{
	/* This is a case where there is no record existing.
	 * So we are not spending any time to copy records etc.
	 */
    fprintf(stderr, "LIBFPIF: Empty record, cannot use for verification\n");
}
}while((tmp_idx++ < MAX_USERS));
#endif
fprintf(stderr, "LIBFPIF: Exit __FUNCTION__ = %s\n", __func__);
return r;
}

int enroll_finger(char *user, enum gender gen, enum fp_finger finger_id) {
    int r = -1;
    struct fp_print_data *data = NULL;
    data = enroll_finger_img();
    if (NULL != data) {
        r = -1;
        switch (finger_id) {
            case LEFT_THUMB:
                fprintf(stderr, "LIBFPIF: Please provide LEFT THUMB impression\n");
                r = fp_print_data_save(data, LEFT_THUMB);
                file_operation(user, gen, finger_id, EN_FP_RECORD);
                fprintf(stderr, "LIBFPIF: Done.\n\n");
                break;
            case LEFT_INDEX:
                fprintf(stderr, "LIBFPIF: Please provide LEFT INDEX impression\n");
                r = fp_print_data_save(data, LEFT_INDEX);
                file_operation(user, gen, finger_id, EN_FP_RECORD);
                fprintf(stderr, "LIBFPIF: Done.\n\n");
                break;
            case LEFT_MIDDLE:
                fprintf(stderr, "LIBFPIF: Please provide LEFT MIDDLE impression\n");
                r = fp_print_data_save(data, LEFT_MIDDLE);
                file_operation(user, gen, finger_id, EN_FP_RECORD);
                fprintf(stderr, "LIBFPIF: Done.\n\n");
                break;
            case LEFT_RING:
                fprintf(stderr, "LIBFPIF: Please provide LEFT RING impression\n");
                r = fp_print_data_save(data, LEFT_RING);
                file_operation(user, gen, finger_id, EN_FP_RECORD);
                fprintf(stderr, "LIBFPIF: Done.\n\n");
                break;
            case LEFT_LITTLE:
                fprintf(stderr, "LIBFPIF: Please provide LEFT LITTLE impression\n");
                r = fp_print_data_save(data, LEFT_LITTLE);
                file_operation(user, gen, finger_id, EN_FP_RECORD);
                fprintf(stderr, "LIBFPIF: Done.\n\n");
                break;
            case RIGHT_THUMB:
                fprintf(stderr, "LIBFPIF: Please provide RIGHT THUMB impression\n");
                r = fp_print_data_save(data, RIGHT_THUMB);
                file_operation(user, gen, finger_id, EN_FP_RECORD);
                fprintf(stderr, "LIBFPIF: Done.\n\n");
                break;
            case RIGHT_INDEX:
                fprintf(stderr, "LIBFPIF: Please provide RIGHT INDEX impression\n");
                r = fp_print_data_save(data, RIGHT_INDEX);
                file_operation(user, gen, finger_id, EN_FP_RECORD);
                fprintf(stderr, "LIBFPIF: Done.\n\n");
                break;
            case RIGHT_MIDDLE:
                fprintf(stderr, "LIBFPIF: Please provide RIGHT MIDDLE impression\n");
                r = fp_print_data_save(data, RIGHT_MIDDLE);
                file_operation(user, gen, finger_id, EN_FP_RECORD);
                fprintf(stderr, "LIBFPIF: Done.\n\n");
                break;
            case RIGHT_RING:
                fprintf(stderr, "LIBFPIF: Please provide RIGHT RING impression\n");
                r = fp_print_data_save(data, RIGHT_RING);
                file_operation(user, gen, finger_id, EN_FP_RECORD);
                fprintf(stderr, "LIBFPIF: Done.\n\n");
                break;
            case RIGHT_LITTLE:
                fprintf(stderr, "LIBFPIF: Please provide RIGHT LITTLE impression\n");
                r = fp_print_data_save(data, RIGHT_LITTLE);
                file_operation(user, gen, finger_id, EN_FP_RECORD);
                fprintf(stderr, "LIBFPIF: Done.\n\n");
                break;
            default:
                fprintf(stderr, "LIBFPIF:Not more than 10 fingers allowed!!\n");
                break;
        }

        if (r >= 0) {
            r = add_user_record(user, gen, finger_id);
            if (r < 0)
                fprintf(stderr, "LIBFPIF: Add record failed\n");
            else
                fprintf(stderr, "LIBFPIF: add record success\n");
        } else {
            fprintf(stderr, "LIBFPIF: file operations a success\n");
        }

        fp_print_data_free(data);
        data = NULL;
    }
    return r;
}

/* Locate if the user record exists
 */
static int locate_user_record(char *user, enum gender gen) {
    int loop_cnt = 0;
    int cmp = 0;
    int usr_identified = -1;

    usr_idx = -1;
    for (loop_cnt = 0; loop_cnt < MAX_USERS; loop_cnt++) {
        cmp = strcmp(usr_record[loop_cnt].user, user);
        if (0 == cmp) {
            if (usr_record[loop_cnt].gen == gen) {
                usr_idx = loop_cnt;
                usr_identified = 0;
            }
        }
    }
    return usr_identified;
}

int find_empty_idx() {
    int loop_cnt = 0;
    int idx = -1;

	/* This is how we do it.
	 * Run the entire loop from 0 to 9
	 * if we find '\0' that means its empty index
	 */
    for (loop_cnt = 0; loop_cnt < MAX_USERS; loop_cnt++) {
        if (0 == strcmp(usr_record[loop_cnt].user, "\0")) {
            idx = loop_cnt;
            break;
        }
    }

    return idx;
}

int write_to_tmp_file() {
    int r = -1;
    int fd = 0;
    int idx = 0;
    char *buffer = NULL;
    int buffer_len = 0;
    char filename[50] = { 0 };
    sprintf(filename, "%s%s", DEFAULT_DB_PATH, USER_TMP_DB_FILE);
    fd = open(filename, O_CREAT | O_RDWR, S_IRWXU);
    if (fd < 0) {
        fprintf(stderr, "LIBFPIF: failed to open file\n");
    }

    buffer = (char *) malloc(500);
    if (NULL == buffer) {
        fprintf(stderr, "LIBFPIF: Failed to allocate memory for buffer\n");
    }

    for (idx = 0; idx < MAX_USERS; idx++) {
        if (0 != strcmp(usr_record[idx].user, "\0")) {
            sprintf(buffer + buffer_len, "%s %d %d %d %d %d %d %d %d %d %d %d\n", usr_record[idx].user, (usr_record[idx].gen), (usr_record[idx].fp_lt), (usr_record[idx].fp_li),
                    (usr_record[idx].fp_lm), (usr_record[idx].fp_lr), (usr_record[idx].fp_ll), (usr_record[idx].fp_rt), (usr_record[idx].fp_ri), (usr_record[idx].fp_rm), (usr_record[idx].fp_rr),
                    (usr_record[idx].fp_rl));
            buffer_len = strlen(buffer);
        }
    }

    lseek(fd, 0, SEEK_SET);
    r = write(fd, buffer, buffer_len);

    if (r < 0) {
        fprintf(stderr, "LIBFPIF: Could not write records to file\n");
    } else {
        fprintf(stderr, "LIBFPIF: Records written to file\n");
    }

    close(fd);
    free(buffer);
    return r;
}

/* This function is to be called, only and only when we want to _ADD_
 * new user and gender
 * For existing users, this function, should not get called at all.
 * For existing users, call modify_user_record()
 */
static int add_new_user() {
    int r = -1;
    char ex_buff[500] = { 0 };

	/* This is again going to be complicated logic to write
	 * to CSV file
	 */
	/* Unfortunately, we cannot modify the contents of existing file
	 * Because, even post modification, the old contents still remains.
	 * So, lets create another dummy file for now and then replace
	 * default_db_file
	 */
    r = write_to_tmp_file();

    if (r > 0) {

        memset(ex_buff, 0, sizeof(ex_buff));
        sprintf(ex_buff, "rm -v %s%s", DEFAULT_DB_PATH, USER_DB_FILE);
        r = system(ex_buff);
        if (r >= 0) {
            memset(ex_buff, 0, sizeof(ex_buff));
            sprintf(ex_buff, "mv -v %s%s %s%s", DEFAULT_DB_PATH, USER_DB_FILE, DEFAULT_DB_PATH, USER_TMP_DB_FILE);
            r = system(ex_buff);
            if (r < 0) {
                fprintf(stderr, "LIBFPIF: Failed to execute the mv command\n");
            }
        } else {
            fprintf(stderr, "LIBFPIF: Failed to execute rm command\n");
        }
    }
    return r;
}

/* Delete has 3 distinct categories
 * 1. Delete finger of a user
 * 2. Delete entire record of an indivisual user
 * 3. Delete the entire database of all users
 * The last parameter in this category cat will handle which action to take
 */
int delete_user_record(char *user, enum gender gen, enum fp_finger f_id, enum del_category cat) {
    int r = 0;
    if (NULL != user) {
        switch (cat) {
            case EN_DEL_FINGER:
                r = delete_finger(user, gen, f_id);
                if (0 == r) {
                    r = modify_user_record(user, gen, f_id, EN_FP_DELETE);
                    if (0 == r) {
                        fprintf(stderr, "LIBFPIF: modification carried out successfully\n");
                    } else {
                        fprintf(stderr, "LIBFPIF: modify operation failed successfully\n");
                    }
                }
                break;
            case EN_DEL_USER:
                r = delete_individual_user(user, gen);
                break;
            case EN_DEL_ALL_RECORDS:
                r = delete_all_records();
                break;
            default:
                    //fprintf(stderr, "LIBFPIF: Delete has the above operations\n");
                break;
        }
    }
    return r;
}
/* There are 2 aspects to this
 * if(user_exists)
 * 		add_finger_entry
 * else
 *		add_user_gen_finger_entry
 */
int add_user_record(char *user, enum gender gen, enum fp_finger f_id) {

    int r = -1;
    int add_idx = -1;
    r = locate_user_record(user, gen);
    if (0 == r) {
        r = modify_user_record(user, gen, f_id, EN_FP_RECORD);
        if (0 == r) {
            fprintf(stderr, "LIBFPIF: finger entry added successfully\n");
        } else {
            fprintf(stderr, "LIBFPIF: Failed to add finger entry to record\n");
        }
    } else //user record does not exist, add user and all related records
    {
            /* Find which index is idle in the usr_record
             * And to that index add new user
             */
        add_idx = find_empty_idx();
        if (add_idx >= 0) {
            strncpy(usr_record[add_idx].user, user, strlen(user));
            usr_record[add_idx].gen = gen;
            switch (f_id) {
                case LEFT_THUMB:
                    usr_record[add_idx].fp_lt = 1;
                    break;
                case LEFT_INDEX:
                    usr_record[add_idx].fp_li = 1;
                    break;
                case LEFT_MIDDLE:
                    usr_record[add_idx].fp_lm = 1;
                    break;
                case LEFT_RING:
                    usr_record[add_idx].fp_lr = 1;
                    break;
                case LEFT_LITTLE:
                    usr_record[add_idx].fp_ll = 1;
                    break;
                case RIGHT_THUMB:
                    usr_record[add_idx].fp_rt = 1;
                    break;
                case RIGHT_INDEX:
                    usr_record[add_idx].fp_ri = 1;
                    break;
                case RIGHT_MIDDLE:
                    usr_record[add_idx].fp_rm = 1;
                    break;
                case RIGHT_RING:
                    usr_record[add_idx].fp_rr = 1;
                    break;
                case RIGHT_LITTLE:
                    usr_record[add_idx].fp_rl = 1;
                    break;
                default:
                    fprintf(stderr, "LIBFPIF: Only 10 fingers. Nothing more to delete\n");
                    break;
            }
            r = add_new_user();
            if (r < 0) {
                fprintf(stderr, "LIBFPIF: failed to write to the file\n");
            }
        }
    }
    return r;
}

/* This is _modify_ user record
 * so first search for the record
 * Then modify the finger entry
 */
static int modify_user_record(char *user, enum gender gen, enum fp_finger f_id, enum action_id action) {
    int r = -1;
    r = locate_user_record(user, gen);
    if (0 == r) {
        switch (f_id) {
            case LEFT_THUMB:
                if (EN_FP_DELETE == action)
                    usr_record[usr_idx].fp_lt = 0;
                else if (EN_FP_RECORD == action)
                    usr_record[usr_idx].fp_lt = 1;
                else
                    fprintf(stderr, "LIBFPIF: Additional operations not supported\n");
                break;
            case LEFT_INDEX:
                if (EN_FP_DELETE == action)
                    usr_record[usr_idx].fp_li = 0;
                else if (EN_FP_RECORD == action)
                    usr_record[usr_idx].fp_li = 1;
                else
                    fprintf(stderr, "LIBFPIF: Additional operations not supported\n");
                break;
            case LEFT_MIDDLE:
                if (EN_FP_DELETE == action)
                    usr_record[usr_idx].fp_lm = 0;
                else if (EN_FP_RECORD == action)
                    usr_record[usr_idx].fp_lm = 1;
                else
                    fprintf(stderr, "LIBFPIF: Additional operations not supported\n");
                break;
            case LEFT_RING:
                if (EN_FP_DELETE == action)
                    usr_record[usr_idx].fp_lr = 0;
                else if (EN_FP_RECORD == action)
                    usr_record[usr_idx].fp_lr = 1;
                else
                    fprintf(stderr, "LIBFPIF: Additional operations not supported\n");
                break;
            case LEFT_LITTLE:
                if (EN_FP_DELETE == action)
                    usr_record[usr_idx].fp_ll = 0;
                else if (EN_FP_RECORD == action)
                    usr_record[usr_idx].fp_ll = 1;
                else
                    fprintf(stderr, "LIBFPIF: Additional operations not supported\n");
                break;
            case RIGHT_THUMB:
                if (EN_FP_DELETE == action)
                    usr_record[usr_idx].fp_rt = 0;
                else if (EN_FP_RECORD == action)
                    usr_record[usr_idx].fp_rt = 1;
                else
                    fprintf(stderr, "LIBFPIF: Additional operations not supported\n");
                break;
            case RIGHT_INDEX:
                if (EN_FP_DELETE == action)
                    usr_record[usr_idx].fp_ri = 0;
                else if (EN_FP_RECORD == action)
                    usr_record[usr_idx].fp_ri = 1;
                else
                    fprintf(stderr, "LIBFPIF: Additional operations not supported\n");
                break;
            case RIGHT_MIDDLE:
                if (EN_FP_DELETE == action)
                    usr_record[usr_idx].fp_rm = 0;
                else if (EN_FP_RECORD == action)
                    usr_record[usr_idx].fp_rm = 1;
                else
                    fprintf(stderr, "LIBFPIF: Additional operations not supported\n");
                break;
            case RIGHT_RING:
                if (EN_FP_DELETE == action)
                    usr_record[usr_idx].fp_rr = 0;
                else if (EN_FP_RECORD == action)
                    usr_record[usr_idx].fp_rr = 1;
                else
                    fprintf(stderr, "LIBFPIF: Additional operations not supported\n");
                break;
            case RIGHT_LITTLE:
                if (EN_FP_DELETE == action)
                    usr_record[usr_idx].fp_rl = 0;
                else if (EN_FP_RECORD == action)
                    usr_record[usr_idx].fp_rl = 1;
                else
                    fprintf(stderr, "LIBFPIF: Additional operations not supported\n");
                break;
            default:
                fprintf(stderr, "LIBFPIF: Only 10 fingers. Nothing more to delete\n");
                break;
        }

        r = add_new_user();
    }
    return r;
}

/* Delete the record of a user depending on user and finger id
 * if f_id = 0, delete all records
 * else, delete indivisual record
 */
static int delete_finger(char *user, enum gender gen, enum fp_finger finger_id) {
    enum fp_finger loop;
    int r;
    r = locate_user_record(user, gen);
    if (0 == r) {
        if (0 == finger_id) {
            for (loop = LEFT_THUMB; loop <= RIGHT_LITTLE; loop++) {
                r = file_operation(user, gen, loop, EN_FP_DELETE);
            }
        } else
            file_operation(user, gen, finger_id, EN_FP_DELETE);
    }
    return r;
}

/* This is for deleting all the user records
 * Cleanup the database file first
 * Cleanup the records from the default_database folder
 * Cleanup the records from default_record folder also
 * Also, dont forget to create the db file again, we are going to need it
 */
static int delete_all_records() {
	/* Lets delete the db csv file first
	 */
    int r = -1;
    char ex_buff[500] = { 0 };
	/* This is deleting all the contents of the DEFAULT_DB_PATH
	 */
    memset(ex_buff, 0, sizeof(ex_buff));
    sprintf(ex_buff, "rm -v %s*", DEFAULT_DB_PATH);
    r = system(ex_buff);
    if (r >= 0) {
        memset(ex_buff, 0, sizeof(ex_buff));
        sprintf(ex_buff, "rm -v ~/.fprint/prints/%04d/%08d/*", storage_driver_id, storage_devtype);
        r = system(ex_buff);
        if (r >= 0) {
                /* Just deleting the file is not good enough,
                 * Need to recreate the file, else all next operations will return error
                 */
            memset(ex_buff, 0, sizeof(ex_buff));

            sprintf(ex_buff, "touch %s%s", DEFAULT_DB_PATH, USER_DB_FILE);
            r = system(ex_buff);
            if (r >= 0) {
                fprintf(stderr, "LIBFPIF: Successfully created the db file\n");
            } else {
                fprintf(stderr, "!!! All user records cleaned up !!!\n");
            }
        } else {
            fprintf(stderr, "LIBFPIF: Failed to remove prints from storage loc\n");
        }
    } else {
        fprintf(stderr, "LIBFPIF: Failed to remove all prints\n");
    }
    return r;
}

/* Here, all the records for a user need to be deleted
 * 1. locate the user record
 * 2. Delete the user record from csv file
 * 3. Replace the csv file with new one
 * 4. Delete the user records from DEFAULT_DB_PATH
 */
static int delete_individual_user(char *user, enum gender gen) {
    int r = -1;
    enum fp_finger loop;
    r = locate_user_record(user, gen);
    if (0 == r) // User record exists, just update the finger entry
    {
        for (loop = LEFT_THUMB; loop <= RIGHT_LITTLE; loop++) {
            r = file_operation(user, gen, loop, EN_FP_DELETE);
            if (0 == r) {
                fprintf(stderr, "LIBFPIF: finger entry deleted successfully\n");
            } else {
                fprintf(stderr, "LIBFPIF: Failed to delete finger entry to record\n");
            }
        }
            /* usr_idx is what is the record location of user in the csv file
             * Make this entry as zero and then again re-write the CSV file
             */
        memset(&usr_record[usr_idx], 0, sizeof(fp_usr_record));

            /* Now stargs again the tedious process of writting to tmp csv file and replacing
             * original db file
             */
        r = write_to_tmp_file();
        if (r < 0) {
            fprintf(stderr, "LIBFPIF: Failed to delete the user entry\n");
        }
    }
    return r;
}
