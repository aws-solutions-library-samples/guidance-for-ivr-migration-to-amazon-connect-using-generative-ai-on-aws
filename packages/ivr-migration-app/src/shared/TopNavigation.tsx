/*
 * MIT No Attribution
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { useAuthenticator } from '@aws-amplify/ui-react';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import './TopNavigation.css';

// eslint-disable-next-line react-refresh/only-export-components
export default () => {
	const { user, signOut } = useAuthenticator((context) => [context.user]);
	const navigate = useNavigate();
	const i18nStrings = {
		searchIconAriaLabel: 'Search',
		searchDismissIconAriaLabel: 'Close search',
		overflowMenuTriggerText: 'More',
		overflowMenuTitleText: 'All',
		overflowMenuBackIconAriaLabel: 'Back',
		overflowMenuDismissIconAriaLabel: 'Close menu',
	};

	return (
		<TopNavigation
			i18nStrings={i18nStrings}
			identity={{
				href: '/',
				onFollow: (event) => {
					event.preventDefault();
					navigate('/');
				},
				title: 'IVR Migration Tool'
			}}
			utilities={[
				{
					type: 'menu-dropdown',
					text: user?.signInDetails?.loginId ?? 'User Details',
					iconName: 'user-profile',
					onItemClick: async (event) => {
						if (event.detail.id === 'signout') {
							signOut();
						} else if (event.detail.id === 'authToken') {
							const idToken = (await fetchAuthSession()).tokens?.idToken?.toString();
							navigator.clipboard.writeText(idToken ?? 'Copy Failed');
						}
					},
					items: [
						{ id: 'authToken', text: 'Copy Auth Token', iconName: 'copy' },
						{ id: 'signout', text: 'Sign out' },
					],
				},
			]}
		/>
	);
};
