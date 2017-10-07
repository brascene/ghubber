// @author Dmitry Patsura <talk@dmtry.me> https://github.com/ovr
// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, ScrollView, FlatList, Text } from 'react-native';
import Modal from 'react-native-modal';
import { ErrorView, Spinner, Badge, UIText, ReactionGroup, Blank, Comment, CommitRow, RowSeparator, Button, ImageButton } from 'components';
import { IndicatorViewPager, PagerTitleIndicator } from 'rn-viewpager';
import { fetchPullRequest, showRepositoryCommit } from 'actions';
import { normalizeFont } from 'utils/helpers';

// import flow types
import type { RepositoryPullRequestState } from 'reducers/repository-pull-request';

type Props = {
    state: RepositoryPullRequestState,
    navigation: {
        params: {
            owner: string,
            repo: string,
            number: number
        }
    },
    fetchPullRequest: typeof fetchPullRequest,
    showRepositoryCommit: typeof showRepositoryCommit,
}

type ModalState = {
    modalVisible: boolean,
}

const TITLE_COMMITS_INDEX = 1;

function getStateColor(state: string): string {
    switch (state.toLowerCase()) {
        case 'open':
            return '#2cbe4e';
        case 'merged':
            return '#6f42c1';
        case 'closed':
            return '#cb2431';
        default:
            throw new Error(`Unknown state: ${state}`);
    }
}

class RepositoryPullRequestScreen extends PureComponent<Props, ModalState> {
    state: ModalState = {
        modalVisible: false
    };

    componentWillMount() {
        this.fetchPullRequest();
    }

    fetchPullRequest() {
        const params = this.props.navigation.params;

        this.props.fetchPullRequest(
            params.owner,
            params.repo,
            params.number,
        );
    }

    renderTitle = (index: number, title: string): React.Element<any> => {
        const { pullRequest } = this.props.state;

        if (index === TITLE_COMMITS_INDEX && pullRequest) {
            return (
                <View style={styles.pageTitleWrapper}>
                    <UIText>
                        Commits
                    </UIText>
                    <UIText style={styles.badge}>
                        {pullRequest.commits.nodes.length}
                    </UIText>
                </View>
            );
        }

        return (
            <UIText>
                {title}
            </UIText>
        );
    };

    getTitles() {
        const { pullRequest } = this.props.state;

        return [
            'Overview',
            // Upd title on loading
            pullRequest ? `${pullRequest.commits.nodes.length}` : '0'
        ];
    }

    setModalVisible(visible) {
      this.setState({ modalVisible: visible });
    }

    renderOverView(pullRequest: Object): React.Element<any> {
        return (
            <ScrollView style={styles.overview}>
                <View style={styles.header}>
                    <UIText style={styles.title}>{pullRequest.title}</UIText>
                    <View style={styles.issueInfo}>
                        <Badge
                            text={pullRequest.state}
                            backgroundColor={getStateColor(pullRequest.state)}
                        />
                    </View>
                </View>
                <UIText style={styles.body}>{pullRequest.body}</UIText>
                <ImageButton
                  style={styles.button}
                  onPress={() => this.setModalVisible(true)}
                  styleText={styles.buttonText}>
                  Close PR
                </ImageButton>
                <Modal
                  style={styles.modalContainer}
                  isVisible={this.state.modalVisible}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Merge this pull request?</Text>
                    <Button
                      style={styles.deletePr}
                      textStyle={styles.deletePrText}
                      onPress={() => this.setModalVisible(false)}>
                      Merge
                    </Button>
                  </View>
                </Modal>
                <ReactionGroup reactions={pullRequest.reactionGroups} />
                <FlatList
                    style={styles.commentsList}
                    data={pullRequest.comments.nodes}
                    keyExtractor={(comment: Object) => comment.id}
                    renderItem={
                        ({ item }) => (
                            <Comment
                                key={'comment' + item.id}
                                comment={item}
                            />
                        )
                    }
                    refreshing={false}
                />
                <Blank />
            </ScrollView>
        );
    }

    onCommitPress = (item: Object) => {
        const params = this.props.navigation.params;

        this.props.showRepositoryCommit(
            params.owner,
            params.repo,
            item.oid,
        );
    };

    renderCommits(pullRequest: Object): React.Element<any> {
        return (
            <View style={styles.wrapper}>
                <FlatList
                    style={styles.wrapper}
                    data={pullRequest.commits.nodes}
                    keyExtractor={(repository: Object) => repository.id}
                    renderItem={
                        ({ item }) => (
                            <CommitRow
                                key={'commit' + item.commit.id}
                                commit={item.commit}
                                onPress={() => this.onCommitPress(item.commit)}
                            />
                        )
                    }
                    ItemSeparatorComponent={RowSeparator}
                    refreshing={false}
                />
            </View>
        );
    }

    render() {
        const { loading, error, pullRequest } = this.props.state;

        if (loading) {
            return (
                <View style={styles.container}>
                    <Spinner />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.container}>
                    <ErrorView
                        error={error}
                        refreshable={true}
                        onPress={() => this.fetchPullRequest()}
                    />
                </View>
            );
        }

        if (!pullRequest) {
            return null;
        }

        return (
            <IndicatorViewPager
                style={styles.viewPager}
                indicator={
                    <PagerTitleIndicator
                        titles={this.getTitles()}
                        renderTitle={this.renderTitle}
                    />
                }
            >
                <View style={styles.page}>
                    {this.renderOverView(pullRequest)}
                </View>
                <View style={styles.page}>
                    {this.renderCommits(pullRequest)}
                </View>
            </IndicatorViewPager>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    viewPager: {
        flex: 1,
        flexDirection: 'column-reverse',
    },
    page: {
        flex: 1,
        paddingHorizontal: 10
    },
    button: {
        width: 80, height: 30,
        backgroundColor: '#edf1f5',
    },
    deletePr: {
      width: 70, marginTop: 10,
      backgroundColor: '#52c245',
    },
    deletePrText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    buttonText: {
        color: 'black',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        backgroundColor: 'transparent'
    },
    modalTitle: {
      color: 'black',
      fontSize: 14, marginTop: 8,
      fontWeight: '600',
      textAlign: 'center',
    },
    modalContainer: {
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: 200, height: 80, borderRadius: 10,
      backgroundColor: '#fff', flexDirection: 'column', alignItems: 'center'
    },
    wrapper: {
        flex: 1
    },
    overview: {
        flex: 0,
        paddingTop: 10
    },
    issueInfo: {
        flex: 1,
        flexDirection: 'row',
        marginVertical: 10,
    },
    header: {
    },
    title: {
        fontSize: normalizeFont(18),
        fontWeight: 'bold',
    },
    body: {
        fontSize: normalizeFont(14)
    },
    pageTitleWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    badge: {
        fontSize: 12,
        marginLeft: 10,
        backgroundColor: '#3498db',
        color: '#fff',
        paddingVertical: 3,
        paddingHorizontal: 5
    },
    commentsList: {
        flex: 1,
        marginTop: 10
    }
});

export default connect(
    (state) => {
        return {
            navigation: state.navigation,
            state: state.repositoryPullRequest
        };
    },
    { fetchPullRequest, showRepositoryCommit }
)(RepositoryPullRequestScreen);
