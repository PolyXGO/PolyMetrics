jQuery(document).ready(function ($) {
    'use strict'; // Idea

    setTimeout(function () {
      // Check if on edit item page and setup 2-column layout
      PolyEnvato.setupEditPageLayout();
      
      //Elements
      PolyEnvato.initTools();
      
      // Initialize bookmark icon
      PolyEnvato.initBookmarkIcon();
      
      // Restore bookmarks panel state
      PolyEnvato.restoreBookmarksPanelState();

      //Scroll to top
      // Set default values with destructuring
      var poly_metrics_settings = {};
      const { scroll_to_top_right = 10, scroll_to_top_bottom = 44, icon_height = 26 } =
        poly_metrics_settings;

      // Define the scroll-to-top button HTML

      const tools_items = PolyOperationFunctions.AnchorsToObjects();
        let resultString = tools_items.map(function(item) {
            return `<a href="${item.link}">${item.text}</a>`;
        }).join('');

      const scrollToTopHTML = `
      <div class="poly-metrics-tools">${resultString}</div>

  <div class="poly-metrics-scroll-to-top" style="right:${scroll_to_top_right}px; bottom:${scroll_to_top_bottom}px;">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-circle-fill" viewBox="0 0 16 16">
  <path d="M16 8A8 8 0 1 0 0 8a8 8 0 0 0 16 0m-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z"/>
</svg>
  </div>

<div class="poly-metrics-scroll-to-bottom" style="right:${scroll_to_top_right}px; bottom:${scroll_to_top_bottom - icon_height -2 }px;">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-circle-fill" viewBox="0 0 16 16">
  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293z"/>
</svg>
</div>

<div class="poly-metrics-scroll-to-recommended" style="display: inline-flex; align-items: center; justify-content: center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-left-dots" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
  <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
</svg>
</div>

<div id="poly-bookmarks-btn" class="poly-metrics-bookmarks" style="display: inline-flex; align-items: center; justify-content: center" title="Bookmarks"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
  <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z"/>
</svg>
</div>
`;

      // Append the scroll-to-top button to the body
      $("body").append(scrollToTopHTML);
      // Scroll to top
      PolyOperationFunctions.ScrollToTop(['.poly-metrics-scroll-to-top']);
      PolyOperationFunctions.ScrollToTop(['.poly-metrics-scroll-to-recommended'],'#recommended_items');
      PolyOperationFunctions.ScrollToBottom(['.poly-metrics-scroll-to-bottom']);
      
      // Bookmarks button handler
      $('#poly-bookmarks-btn').on('click', () => {
          PolyEnvato.toggleBookmarksPanel();
      });

      //Estimate
      PolyEnvato.aggregateCalculations();
      //Send message
      //PolyEnvato.sendMessage();

      // Refresh every 10s then send data to server API. Process data updates in IndexedDB by the hour: number of sales, sale price, profit, etc.
      // startRefreshing(5);
    }, 888);

    function startRefreshing(timeSeconds = 10) {
        setInterval(refreshPage, timeSeconds * 1000);
    }
    function refreshPage() {
        window.location.reload();
    }

     // Follow users feature
     poly_add_follow_users();
     poly_follow_user();
     
     // Copy user-html content feature
     poly_add_copy_user_html();

    function poly_add_follow_users() {
        // List users and add follow and copy buttons
        // Search in #content .content-s, .comment__item and .comment__item-response
        $('#content .content-s a.t-link.-decoration-reversed, .comment__item a.t-link.-decoration-reversed, .comment__item-response a.t-link.-decoration-reversed').each(function () {
            let hrefValue = $(this).attr('href');
            if (hrefValue && hrefValue.includes('/user')) {
                // Add Copy button right after user link (only in comment items and comment responses)
                if ($(this).closest('.comment__item').length > 0 || $(this).closest('.comment__item-response').length > 0) {
                    if (!$(this).next('.poly-copy-comment').length) {
                        let copyBtn = $('<span>', {
                            class: 'e-text-label -margin-left -color-blue poly-copy-comment -size-s',
                            style: 'cursor: pointer; margin-left: 4px;',
                            text: 'Copy'
                        });
                        $(this).after(copyBtn);

                        // Add click event to Copy button
                        copyBtn.on('click', function (e) {
                            e.preventDefault();
                            copyCommentContent($(this));
                        });
                    }
                }
                
                // Add follow button if not exists
                let $followBtn = $(this).next('.poly-follow');
                if (!$followBtn.length) {
                    let afollow = $('<a>', {
                        class: 'poly-follow',
                        style: 'padding: 2px 4px; font-size: 13px; color: red; font-weight: 400',
                        text: '[follow]',
                        rel: 'nofollow',
                        href: `${hrefValue}?refer=1`,
                    });
                    $(this).after(afollow);

                    // Add click event to the newly added anchor
                    afollow.on('click', function (e) {
                        e.preventDefault(); // Prevent default action
                        openLinkInNewTab($(this).attr('href')); // Open link in new tab
                    });
                }
            }
        });
    }

    function copyCommentContent($element) {
        // Find nearest parent with class .comment__item or .comment__item-response
        let $commentItem = $element.closest('.comment__item, .comment__item-response');
        
        if ($commentItem.length === 0) {
            console.log('Comment item not found');
            return;
        }

        // Find .comment__body in comment item
        let $commentBody = $commentItem.find('.comment__body');
        
        if ($commentBody.length === 0) {
            console.log('Comment body not found');
            return;
        }

        // Get full text content
        let textContent = $commentBody.text().trim();

        // Copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textContent).then(function() {
                console.log('Comment content copied to clipboard');
                // Can add feedback for user (optional)
                let originalText = $element.text();
                $element.text('Copied!');
                setTimeout(function() {
                    $element.text(originalText);
                }, 1000);
            }).catch(function(err) {
                console.error('Failed to copy: ', err);
                // Fallback: use old method
                fallbackCopyTextToClipboard(textContent);
            });
        } else {
            // Fallback for browsers not supporting Clipboard API
            fallbackCopyTextToClipboard(textContent);
        }
    }

    function fallbackCopyTextToClipboard(text) {
        let textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            let successful = document.execCommand('copy');
            if (successful) {
                console.log('Comment content copied to clipboard (fallback)');
            } else {
                console.error('Fallback copy failed');
            }
        } catch (err) {
            console.error('Fallback copy error: ', err);
        }
        
        document.body.removeChild(textArea);
    }

    function openLinkInNewTab(url) {
        // Open URL in a new tab without switching focus
        var newWindow = window.open(url, '_blank');
        if (newWindow) {
            newWindow.blur(); // Blur new tab
            window.focus(); // Keep focus on current tab
        }
    }

    function get_param(name) {
        let urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Function to check existence of element and perform action
    function waitForElement(selector) {
        return new Promise((resolve) => {
            if ($(selector).length) {
                resolve($(selector));
            } else {
                const observer = new MutationObserver(() => {
                    if ($(selector).length) {
                        resolve($(selector));
                        observer.disconnect();
                    }
                });
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        });
    }

    // Check if refer=1 then follow if not followed.
    async function poly_follow_user() {
        let ref = get_param('refer');
        if (ref) {
            console.log(`Follow`);
            const $user_cta = await waitForElement('.user-info-header__cta-buttons');
            if ($user_cta) {
                const $follow_json = $user_cta.find('.follow-button').data('props');
                console.log(`${JSON.stringify($follow_json)}`);

                const $is_follow = $follow_json.following;
                if ($is_follow === false) {
                    const $class_element_to_click = $is_follow ? 'unfollow' : 'follow';

                    console.log(
                        `Follow status: ${$is_follow} => click to ${$class_element_to_click} => follow-button__${$class_element_to_click}}`
                    );

                    await triggerClick(
                        `.follow-button__${$class_element_to_click} .e-btn--outline`
                    );

                    // Perform next actions after click logic
                    console.log('Click completed and continue other steps');
                }
            }
        }
    }

    function triggerClick(selector) {
        return new Promise((resolve) => {
            // Use setTimeout to ensure DOM is ready before triggering click
            setTimeout(() => {
                $(selector).one('click', function () {
                    resolve();
                    window.close();
                }).trigger('click');
            }, 100); // Delay 100ms to ensure DOM is ready
        });
    }
    /* Comment toolbar */
    const icons = ["👇", "👉", "👈", "💑", "👩‍❤️‍👩", "👨‍❤️‍👨", "💏", "👩‍❤️‍💋‍👩", "👨‍❤️‍💋‍👨", "💝", "💟", "♥️", "💌", "🎁", "⭕", "❌", "❗", "❕", "❓", "❔", "✅", "✔️", "💤", "☑️", "🔴", "🔵", "💭", "🗯️", "▪️", "🗨️", "💬", "🔗", "🔖", "🏷", "📎", "📌", "📍", "📰", "📋", "💲", "🔔", "💞", "💓", "💗", "🇻🇳",":grin:",":shocked:",":cry:"];
    
    $('.simple_form').each(function () {
        var form = $(this);
        var textarea = form.find('textarea');
        
        if (textarea.length > 0) {
            var toolbar = `
            <div class="polydev_toolbar">
              <button type="button" class="toolbar-btn" data-tag="strong"><strong>B</strong></button>
              <button type="button" class="toolbar-btn" data-tag="em"><em>I</em></button>
              <button type="button" class="toolbar-btn" data-tag="ul">&lt;UL&gt;</button>
              <button type="button" class="toolbar-btn" data-tag="ol">&lt;OL&gt;</button>
              <button type="button" class="toolbar-btn" data-tag="li">&lt;LI&gt;</button>
              <button type="button" class="toolbar-btn" data-tag="h3">&lt;H3&gt;</button>
              <button type="button" class="toolbar-btn" data-tag="h4">&lt;H4&gt;</button>
              <button type="button" class="toolbar-btn" data-tag="pre">&lt;pre&gt;</button>
              <button type="button" class="toolbar-btn" data-tag="code">&lt;code&gt;</button>
              <button type="button" class="toolbar-btn" data-tag="a">&lt;a&gt;</button>
              <button type="button" class="toolbar-media" data-tag="img" data-template="&lt;img src=&quot;&quot; alt=&quot;&quot;&gt;">&lt;img&gt;</button>
              <button type="button" class="toolbar-btn" data-tag="blockquote">Quote</button>
            `;

            icons.forEach(function(icon) {
                toolbar += `<button type="button" class="toolbar-icon" data-icon="${icon}">${icon}</button>`;
            });

            toolbar += `</div>`;

            textarea.before(toolbar);

            form.find('.toolbar-media').click(function () {
                var template = $(this).data('template');
                insertTemplateAtCursor(textarea[0], template);
            });

            form.find('.toolbar-btn').click(function () {
                var tag = $(this).data('tag');
                wrapSelectedTextWithTag(textarea[0], tag);
            });

            form.find('.toolbar-icon').click(function () {
                var icon = $(this).data('icon');
                insertAtCursor(textarea[0], icon);
            });
        }
    });

    function wrapSelectedTextWithTag(textarea, tag) {
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var text = textarea.value.substring(start, end);

        if (!text) {
            if (tag === 'ul') {
                text = '<ul>\n    <li></li>\n    <li></li>\n</ul>';
            } else if (tag === 'ol') {
                text = '<ol>\n    <li></li>\n    <li></li>\n</ol>';
            } else if (tag === 'li') {
                text = '<li></li>';
            } else if (tag === 'a') {
                text = '<a href="#" rel="nofollow" target="_blank"></a>';
            } else {
                text = `<${tag}></${tag}>`;
            }
        } else {
            // Special handling for ol and ul: wrap each line with <li></li>
            if (tag === 'ol' || tag === 'ul') {
                var lines = text.split('\n');
                var listItems = lines
                    .map(function(line) {
                        return line.trim();
                    })
                    .filter(function(line) {
                        return line.length > 0;
                    })
                    .map(function(line) {
                        return '    <li>' + line + '</li>';
                    });
                
                if (listItems.length > 0) {
                    text = '<' + tag + '>\n' + listItems.join('\n') + '\n</' + tag + '>';
                } else {
                    text = '<' + tag + '>\n    <li></li>\n</' + tag + '>';
                }
            } else if (tag === 'a') {
                // Special handling for anchor tag
                var trimmedText = text.trim();
                // Check if text is a URL (starts with http:// or https://)
                var isUrl = /^https?:\/\//i.test(trimmedText);
                
                if (isUrl) {
                    // If text is a URL, use it as both href and anchor text
                    text = '<a href="' + trimmedText + '" rel="nofollow" target="_blank">' + trimmedText + '</a>';
                } else {
                    // If text is not a URL, use it as anchor text with href="#"
                    text = '<a href="#" rel="nofollow" target="_blank">' + trimmedText + '</a>';
                }
            } else {
                text = `<${tag}>${text}</${tag}>`;
            }
        }

        var before = textarea.value.substring(0, start);
        var after = textarea.value.substring(end, textarea.value.length);
        textarea.value = before + text + after;
        textarea.setSelectionRange(
            before.length + text.length,
            before.length + text.length
        );
    }

    function insertTemplateAtCursor(textarea, template) {
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        textarea.value =
            textarea.value.substring(0, start) +
            template +
            textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + template.length;
    }

    function insertAtCursor(textarea, text) {
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        textarea.value =
            textarea.value.substring(0, start) +
            text +
            textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
    }

    // Add copy button for user-html content
    function poly_add_copy_user_html() {
        $('.user-html.user-html__with-lazy-load').each(function() {
            var $userHtml = $(this);
            
            // Check if copy button already exists
            if ($userHtml.prev('.poly-copy-user-html-btn').length > 0) {
                return;
            }
            
            // Create copy button
            var $copyBtn = $('<button>', {
                class: 'poly-copy-user-html-btn e-text-label -margin-left -color-blue -size-s',
                style: 'cursor: pointer; margin-bottom: 8px; padding: 4px 8px; border: 1px solid #4a90e2; border-radius: 4px; background: #f0f7ff; color: #4a90e2; font-size: 12px;',
                text: 'Copy as Markdown'
            });
            
            // Add button above user-html element
            $userHtml.before($copyBtn);
            
            // Add click event
            $copyBtn.on('click', function(e) {
                e.preventDefault();
                copyUserHtmlAsMarkdown($userHtml, $(this));
            });
        });
    }

    // Convert HTML to Markdown and copy
    function copyUserHtmlAsMarkdown($element, $button) {
        // Clone element to avoid modifying original DOM
        var $clone = $element.clone();
        
        // Remove all <a> tags (links)
        $clone.find('a').each(function() {
            var $link = $(this);
            var text = $link.text().trim();
            // Replace link with its text
            $link.replaceWith(text);
        });
        
        // Remove all <img> tags
        $clone.find('img').remove();
        
        // Get HTML after removing links and images
        var htmlContent = $clone.html();
        
        // Convert HTML to Markdown
        var markdown = htmlToMarkdown(htmlContent);
        
        // Copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(markdown).then(function() {
                console.log('User HTML content copied as markdown');
                var originalText = $button.text();
                $button.text('Copied!');
                setTimeout(function() {
                    $button.text(originalText);
                }, 1000);
            }).catch(function(err) {
                console.error('Failed to copy: ', err);
                fallbackCopyTextToClipboard(markdown);
            });
        } else {
            fallbackCopyTextToClipboard(markdown);
        }
    }

    // Convert HTML to Markdown
    function htmlToMarkdown(html) {
        if (!html) return '';
        
        // Create a temporary div to parse HTML
        var $temp = $('<div>').html(html);
        
        // Handle heading tags
        $temp.find('h1').each(function() {
            $(this).replaceWith('# ' + $(this).text().trim() + '\n\n');
        });
        $temp.find('h2').each(function() {
            $(this).replaceWith('## ' + $(this).text().trim() + '\n\n');
        });
        $temp.find('h3').each(function() {
            $(this).replaceWith('### ' + $(this).text().trim() + '\n\n');
        });
        $temp.find('h4').each(function() {
            $(this).replaceWith('#### ' + $(this).text().trim() + '\n\n');
        });
        
        // Handle <strong> and <b> tags
        $temp.find('strong, b').each(function() {
            $(this).replaceWith('**' + $(this).text().trim() + '**');
        });
        
        // Handle <em> and <i> tags
        $temp.find('em, i').each(function() {
            $(this).replaceWith('*' + $(this).text().trim() + '*');
        });
        
        // Handle <code> tags
        $temp.find('code').each(function() {
            $(this).replaceWith('`' + $(this).text().trim() + '`');
        });
        
        // Handle <pre> tags
        $temp.find('pre').each(function() {
            var code = $(this).text().trim();
            $(this).replaceWith('```\n' + code + '\n```\n\n');
        });
        
        // Handle <blockquote> tags
        $temp.find('blockquote').each(function() {
            var text = $(this).text().trim();
            var lines = text.split('\n');
            var quoted = lines.map(function(line) {
                return '> ' + line.trim();
            }).join('\n');
            $(this).replaceWith(quoted + '\n\n');
        });
        
        // Handle <ul> and <ol> tags
        $temp.find('ul, ol').each(function() {
            var $list = $(this);
            var isOrdered = $list.is('ol');
            var items = [];
            
            $list.find('li').each(function(index) {
                var text = $(this).text().trim();
                if (isOrdered) {
                    items.push((index + 1) + '. ' + text);
                } else {
                    items.push('- ' + text);
                }
            });
            
            $(this).replaceWith(items.join('\n') + '\n\n');
        });
        
        // Handle <p> tags
        $temp.find('p').each(function() {
            var text = $(this).text().trim();
            if (text) {
                $(this).replaceWith(text + '\n\n');
            } else {
                $(this).remove();
            }
        });
        
        // Handle <br> tags
        $temp.find('br').each(function() {
            $(this).replaceWith('\n');
        });
        
        // Get final text and cleanup
        var markdown = $temp.text();
        
        // Clean up: remove multiple blank lines
        markdown = markdown.replace(/\n{3,}/g, '\n\n');
        
        // Trim whitespace
        markdown = markdown.trim();
        
        return markdown;
    }
    /* Comment toolbar */
});
